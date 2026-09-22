"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getCurrentProfile } from "@/features/auth/session";
import type { ActionResult } from "@/features/auth/types";
import { createClient } from "@/lib/supabase/server";
import type { VerificationRequest, VerificationRequestStatus } from "./schema";
import {
  getMockVerificationRequest,
  listAllMockVerificationRequests,
  setMockVerificationStatus,
  updateMockVerificationRequest,
} from "./mock-store";

const useMock = process.env.NEXT_PUBLIC_USE_MOCK_DATA !== "false";

const reviewSchema = z.object({
  requestId: z.string().min(1),
  decision: z.enum(["approved", "rejected", "needs_info"]),
  reviewNote: z.string().trim().max(2000).default(""),
});

async function requireAdmin() {
  const profile = await getCurrentProfile();
  if (!profile) return { error: "Sign in required" as const };
  if (profile.role !== "admin") {
    return { error: "Admin only" as const };
  }
  return { profile };
}

export type AdminVerificationRow = VerificationRequest & {
  shelterHandle?: string;
  shelterOrgName?: string;
};

export async function listPendingVerificationRequests(): Promise<
  ActionResult<AdminVerificationRow[]>
> {
  const gate = await requireAdmin();
  if ("error" in gate) return { ok: false, error: gate.error };

  if (useMock) {
    const all = listAllMockVerificationRequests().filter(
      (r) => r.status === "pending" || r.status === "needs_info",
    );
    return {
      ok: true,
      data: all.map((r) => ({
        ...r,
        shelterHandle: "pawshaven",
        shelterOrgName: "Paws Haven (mock)",
      })),
    };
  }

  const supabase = await createClient();
  if (!supabase) {
    return { ok: false, error: "Supabase is not configured" };
  }

  const { data, error } = await supabase
    .from("verification_requests")
    .select(
      `
      id, shelter_id, status, notes, documents, review_note, created_at, reviewed_at,
      shelters ( handle, org_name )
    `,
    )
    .in("status", ["pending", "needs_info"])
    .order("created_at", { ascending: true });

  if (error) {
    console.error("[listPendingVerificationRequests]", error.message);
    return { ok: false, error: "Could not load queue" };
  }

  const items: AdminVerificationRow[] = (data ?? []).map((r) => {
    const s = r.shelters as
      | { handle: string; org_name: string }
      | { handle: string; org_name: string }[]
      | null;
    const shelter = Array.isArray(s) ? s[0] : s;
    return {
      id: r.id,
      shelterId: r.shelter_id,
      status: r.status as VerificationRequestStatus,
      notes: r.notes ?? "",
      documents: Array.isArray(r.documents) ? r.documents : [],
      reviewNote: r.review_note ?? "",
      createdAt: r.created_at,
      reviewedAt: r.reviewed_at,
      shelterHandle: shelter?.handle,
      shelterOrgName: shelter?.org_name,
    };
  });

  return { ok: true, data: items };
}

export async function reviewVerificationRequest(
  raw: unknown,
): Promise<ActionResult<{ id: string }>> {
  const gate = await requireAdmin();
  if ("error" in gate) return { ok: false, error: gate.error };

  const parsed = reviewSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Invalid review",
    };
  }

  const { requestId, decision, reviewNote } = parsed.data;
  const now = new Date().toISOString();

  const shelterStatus =
    decision === "approved"
      ? ("verified" as const)
      : decision === "rejected"
        ? ("rejected" as const)
        : ("pending" as const);

  if (useMock) {
    const existing = getMockVerificationRequest(requestId);
    if (!existing) {
      return { ok: false, error: "Request not found" };
    }
    if (existing.status !== "pending" && existing.status !== "needs_info") {
      return { ok: false, error: "Request is no longer open" };
    }

    updateMockVerificationRequest(requestId, {
      status: decision,
      reviewNote,
      reviewedAt: now,
    });
    setMockVerificationStatus(existing.shelterId, shelterStatus);

    revalidatePath("/admin/verification");
    revalidatePath("/studio/verification");
    revalidatePath("/studio/profile");
    return { ok: true, data: { id: requestId } };
  }

  const supabase = await createClient();
  if (!supabase) {
    return { ok: false, error: "Supabase is not configured" };
  }

  const { data: req, error: fetchError } = await supabase
    .from("verification_requests")
    .select("id, shelter_id, status")
    .eq("id", requestId)
    .maybeSingle();

  if (fetchError || !req) {
    return { ok: false, error: "Request not found" };
  }
  if (req.status !== "pending" && req.status !== "needs_info") {
    return { ok: false, error: "Request is no longer open" };
  }

  const { error: updError } = await supabase
    .from("verification_requests")
    .update({
      status: decision,
      review_note: reviewNote,
      reviewed_by: gate.profile.id,
      reviewed_at: now,
    })
    .eq("id", requestId);

  if (updError) {
    console.error("[reviewVerificationRequest]", updError.message);
    return { ok: false, error: "Could not save review" };
  }

  const shelterPatch: Record<string, unknown> = {
    verification_status: shelterStatus,
  };
  if (decision === "approved") {
    shelterPatch.verified_at = now;
    shelterPatch.verified_by = gate.profile.id;
  }

  const { error: shelterError } = await supabase
    .from("shelters")
    .update(shelterPatch)
    .eq("id", req.shelter_id);

  if (shelterError) {
    console.error("[reviewVerificationRequest] shelter", shelterError.message);
  }

  const { data: shelter } = await supabase
    .from("shelters")
    .select("handle")
    .eq("id", req.shelter_id)
    .maybeSingle();

  revalidatePath("/admin/verification");
  revalidatePath("/studio/verification");
  revalidatePath("/studio/profile");
  if (shelter?.handle) {
    revalidatePath(`/shelter/${shelter.handle}`);
  }

  return { ok: true, data: { id: requestId } };
}
