"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { getCurrentProfile } from "@/features/auth/session";
import type { ActionResult } from "@/features/auth/types";
import { createClient } from "@/lib/supabase/server";
import { rateLimit, RATE_LIMITS } from "@/lib/security";
import {
  resolveReportSchema,
  submitReportSchema,
  type ReportRow,
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

export async function listOpenReports(): Promise<ActionResult<ReportRow[]>> {
  const profile = await getCurrentProfile();
  if (!profile) return { ok: false, error: "Sign in required" };
  if (profile.role !== "admin") return { ok: false, error: "Admin only" };

  if (useMock) {
    return { ok: true, data: listMockOpenReports() };
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

  return { ok: true, data: items };
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

  if (action === "hide_comment") {
    if (existing.target_type !== "comment") {
      return { ok: false, error: "Target is not a comment" };
    }
    const { error: hideError } = await supabase
      .from("comments")
      .update({ hidden_at: now })
      .eq("id", existing.target_id);
    if (hideError) {
      console.error("[resolveReport] hide", hideError.message);
      return { ok: false, error: "Could not hide comment" };
    }
  }

  if (action === "archive_post") {
    if (existing.target_type !== "post") {
      return { ok: false, error: "Target is not a post" };
    }
    const { error: archError } = await supabase
      .from("animal_posts")
      .update({ status: "archived" })
      .eq("id", existing.target_id);
    if (archError) {
      console.error("[resolveReport] archive", archError.message);
      return { ok: false, error: "Could not archive post" };
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
  if (existing.target_type === "post") {
    revalidatePath(`/post/${existing.target_id}`);
    revalidatePath("/explore");
  }

  return { ok: true, data: { id: reportId } };
}
