"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { getCurrentProfile } from "@/features/auth/session";
import type { ActionResult } from "@/features/auth/types";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { rateLimit, RATE_LIMITS } from "@/lib/security";
import {
  resolveReportSchema,
  submitReportSchema,
  type ReportRow,
  type ReportTargetPreview,
} from "./schema";
import {
  addMockReport,
  getMockReport,
  hasOpenMockReport,
  hideMockComment,
  listMockOpenReports,
  archiveMockPost,
  updateMockReport,
} from "./mock-store";

const useMock = process.env.NEXT_PUBLIC_USE_MOCK_DATA !== "false";

export async function submitReport(
  raw: unknown,
): Promise<ActionResult<{ id: string }>> {
  const profile = await getCurrentProfile();
  if (!profile) {
    return { ok: false, error: "Sign in required" };
  }

  const limited = rateLimit(`report:${profile.id}`, RATE_LIMITS.report);
  if (!limited.ok) {
    return {
      ok: false,
      error: `Too many reports. Wait about ${limited.retryAfterSec}s and try again.`,
    };
  }

  const parsed = submitReportSchema.safeParse(raw);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return { ok: false, error: first?.message ?? "Invalid report" };
  }

  const { targetType, targetId, reason, details } = parsed.data;
  const reasonText = details?.trim()
    ? `${reason}: ${details.trim()}`
    : reason;

  if (useMock) {
    if (hasOpenMockReport(profile.id, targetType, targetId)) {
      return { ok: false, error: "You already reported this" };
    }
    const id = `rp-${randomUUID().slice(0, 8)}`;
    const row: ReportRow = {
      id,
      reporterId: profile.id,
      targetType,
      targetId,
      reason: reasonText,
      status: "open",
      resolutionNote: "",
      createdAt: new Date().toISOString(),
      resolvedAt: null,
      target: mockTargetPreview(targetType, targetId),
    };
    addMockReport(row);
    return { ok: true, data: { id } };
  }

  const supabase = await createClient();
  if (!supabase) {
    return { ok: false, error: "Supabase is not configured" };
  }

  const { data, error } = await supabase
    .from("reports")
    .insert({
      reporter_id: profile.id,
      target_type: targetType,
      target_id: targetId,
      reason: reasonText,
      status: "open",
    })
    .select("id")
    .single();

  if (error) {
    if (error.code === "23505") {
      return { ok: false, error: "You already reported this" };
    }
    console.error("[submitReport]", error.message);
    return { ok: false, error: "Could not submit report" };
  }

  return { ok: true, data: { id: data.id } };
}

function mockTargetPreview(
  targetType: "post" | "comment",
  targetId: string,
): ReportTargetPreview {
  if (targetType === "post") {
    return {
      kind: "post",
      name: "Sample animal",
      species: "dog",
      status: "available",
      href: `/post/${targetId}`,
      available: true,
    };
  }
  return {
    kind: "comment",
    body: "This is a sample reported comment for local mock review.",
    authorName: "Member",
    postId: "mock-post",
    postName: "Sample animal",
    hidden: false,
    href: "/explore",
    available: true,
  };
}

function unavailableTarget(
  targetType: "post" | "comment",
): ReportTargetPreview {
  if (targetType === "post") {
    return {
      kind: "post",
      name: "Post unavailable",
      species: "",
      status: "",
      href: "#",
      available: false,
    };
  }
  return {
    kind: "comment",
    body: null,
    authorName: null,
    postId: null,
    postName: null,
    hidden: false,
    href: null,
    available: false,
  };
}

async function enrichReportTargets(rows: ReportRow[]): Promise<ReportRow[]> {
  if (rows.length === 0) return rows;

  const admin = createAdminClient();
  const userClient = await createClient();
  const supabase = admin ?? userClient;
  if (!supabase) {
    return rows.map((r) => ({
      ...r,
      target: r.target ?? unavailableTarget(r.targetType),
    }));
  }

  const postIds = [
    ...new Set(
      rows.filter((r) => r.targetType === "post").map((r) => r.targetId),
    ),
  ];
  const commentIds = [
    ...new Set(
      rows.filter((r) => r.targetType === "comment").map((r) => r.targetId),
    ),
  ];

  const postMap = new Map<
    string,
    { name: string; species: string; status: string }
  >();
  const commentMap = new Map<
    string,
    {
      body: string;
      postId: string;
      hidden: boolean;
      authorName: string | null;
      postName: string | null;
    }
  >();

  if (postIds.length > 0) {
    const { data, error } = await supabase
      .from("animal_posts")
      .select("id, name, species, status")
      .in("id", postIds);
    if (error) {
      console.error("[enrichReportTargets] posts", error.message);
    } else {
      for (const p of data ?? []) {
        postMap.set(p.id, {
          name: p.name,
          species: p.species,
          status: p.status,
        });
      }
    }
  }

  if (commentIds.length > 0) {
    // Service role can read hidden comments; user client only sees non-hidden.
    const { data, error } = await supabase
      .from("comments")
      .select(
        "id, body, post_id, hidden_at, profiles(display_name), animal_posts(name)",
      )
      .in("id", commentIds);
    if (error) {
      console.error("[enrichReportTargets] comments", error.message);
    } else {
      for (const c of data ?? []) {
        const profile = Array.isArray(c.profiles) ? c.profiles[0] : c.profiles;
        const post = Array.isArray(c.animal_posts)
          ? c.animal_posts[0]
          : c.animal_posts;
        commentMap.set(c.id, {
          body: c.body,
          postId: c.post_id,
          hidden: c.hidden_at != null,
          authorName: profile?.display_name ?? null,
          postName: post?.name ?? null,
        });
      }
    }
  }

  return rows.map((row) => {
    if (row.targetType === "post") {
      const p = postMap.get(row.targetId);
      if (!p) {
        return { ...row, target: unavailableTarget("post") };
      }
      return {
        ...row,
        target: {
          kind: "post",
          name: p.name,
          species: p.species,
          status: p.status,
          href: `/post/${row.targetId}`,
          available: true,
        } satisfies ReportTargetPreview,
      };
    }

    const c = commentMap.get(row.targetId);
    if (!c) {
      return { ...row, target: unavailableTarget("comment") };
    }
    return {
      ...row,
      target: {
        kind: "comment",
        body: c.body,
        authorName: c.authorName,
        postId: c.postId,
        postName: c.postName,
        hidden: c.hidden,
        href: c.postId ? `/post/${c.postId}` : null,
        available: true,
      } satisfies ReportTargetPreview,
    };
  });
}

export async function listOpenReports(): Promise<ActionResult<ReportRow[]>> {
  const profile = await getCurrentProfile();
  if (!profile) return { ok: false, error: "Sign in required" };
  if (profile.role !== "admin") return { ok: false, error: "Admin only" };

  if (useMock) {
    const items = listMockOpenReports().map((r) => ({
      ...r,
      target: r.target ?? mockTargetPreview(r.targetType, r.targetId),
    }));
    return { ok: true, data: items };
  }

  const supabase = await createClient();
  if (!supabase) {
    return { ok: false, error: "Supabase is not configured" };
  }

  const { data, error } = await supabase
    .from("reports")
    .select(
      "id, reporter_id, target_type, target_id, reason, status, resolution_note, created_at, resolved_at",
    )
    .eq("status", "open")
    .order("created_at", { ascending: true });

  if (error) {
    console.error("[listOpenReports]", error.message);
    return { ok: false, error: "Could not load reports" };
  }

  const items: ReportRow[] = (data ?? []).map((r) => ({
    id: r.id,
    reporterId: r.reporter_id,
    targetType: r.target_type,
    targetId: r.target_id,
    reason: r.reason,
    status: r.status,
    resolutionNote: r.resolution_note ?? "",
    createdAt: r.created_at,
    resolvedAt: r.resolved_at,
  }));

  const enriched = await enrichReportTargets(items);
  return { ok: true, data: enriched };
}

export async function resolveReport(
  raw: unknown,
): Promise<ActionResult<{ id: string }>> {
  const profile = await getCurrentProfile();
  if (!profile) return { ok: false, error: "Sign in required" };
  if (profile.role !== "admin") return { ok: false, error: "Admin only" };

  const parsed = resolveReportSchema.safeParse(raw);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return { ok: false, error: first?.message ?? "Invalid resolution" };
  }

  const { reportId, action, note } = parsed.data;
  const now = new Date().toISOString();
  const status = action === "dismiss" ? "dismissed" : "actioned";

  if (useMock) {
    const existing = getMockReport(reportId);
    if (!existing || existing.status !== "open") {
      return { ok: false, error: "Report not found or already resolved" };
    }

    if (action === "hide_comment") {
      if (existing.targetType !== "comment") {
        return { ok: false, error: "Target is not a comment" };
      }
      hideMockComment(existing.targetId);
    }
    if (action === "archive_post") {
      if (existing.targetType !== "post") {
        return { ok: false, error: "Target is not a post" };
      }
      archiveMockPost(existing.targetId);
    }

    updateMockReport(reportId, {
      status,
      resolutionNote: note,
      resolvedAt: now,
    });

    revalidatePath("/admin/reports");
    revalidatePath("/admin");
    if (existing.targetType === "post") {
      revalidatePath(`/post/${existing.targetId}`);
      revalidatePath("/explore");
    }
    return { ok: true, data: { id: reportId } };
  }

  const supabase = await createClient();
  if (!supabase) {
    return { ok: false, error: "Supabase is not configured" };
  }

  const { data: existing, error: fetchError } = await supabase
    .from("reports")
    .select("id, target_type, target_id, status")
    .eq("id", reportId)
    .maybeSingle();

  if (fetchError || !existing) {
    return { ok: false, error: "Report not found" };
  }
  if (existing.status !== "open") {
    return { ok: false, error: "Report already resolved" };
  }

  // Privileged mutations (hide / archive) use service role so admin is not
  // blocked by owner-only RLS on animal_posts, and comment hide always works.
  const admin = createAdminClient();
  const writer = admin ?? supabase;

  if (action === "hide_comment") {
    if (existing.target_type !== "comment") {
      return { ok: false, error: "Target is not a comment" };
    }
    const { error: hideError } = await writer
      .from("comments")
      .update({ hidden_at: now })
      .eq("id", existing.target_id);
    if (hideError) {
      console.error("[resolveReport] hide", hideError.message);
      return {
        ok: false,
        error: admin
          ? "Could not hide comment"
          : "Could not hide comment (set SUPABASE_SERVICE_ROLE_KEY for admin actions)",
      };
    }
  }

  if (action === "archive_post") {
    if (existing.target_type !== "post") {
      return { ok: false, error: "Target is not a post" };
    }
    const { error: archError } = await writer
      .from("animal_posts")
      .update({ status: "archived" })
      .eq("id", existing.target_id);
    if (archError) {
      console.error("[resolveReport] archive", archError.message);
      return {
        ok: false,
        error: admin
          ? "Could not archive post"
          : "Could not archive post (set SUPABASE_SERVICE_ROLE_KEY for admin actions)",
      };
    }
  }

  const { error: updError } = await supabase
    .from("reports")
    .update({
      status,
      resolution_note: note,
      resolver_id: profile.id,
      resolved_at: now,
    })
    .eq("id", reportId);

  if (updError) {
    console.error("[resolveReport]", updError.message);
    return { ok: false, error: "Could not resolve report" };
  }

  revalidatePath("/admin/reports");
  revalidatePath("/admin");
  if (existing.target_type === "post") {
    revalidatePath(`/post/${existing.target_id}`);
    revalidatePath("/explore");
  }

  return { ok: true, data: { id: reportId } };
}
