"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getCurrentProfile } from "@/features/auth/session";
import type { ActionResult } from "@/features/auth/types";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const useMock = process.env.NEXT_PUBLIC_USE_MOCK_DATA !== "false";

const reviewSchema = z.object({
  applicationId: z.string().uuid(),
  decision: z.enum(["approved", "rejected"]),
  reviewNote: z.string().trim().max(2000).default(""),
});

export type ShelterApplicationStatus = "pending" | "approved" | "rejected";

export type AdminShelterApplicationRow = {
  id: string;
  applicantId: string;
  handle: string;
  orgName: string;
  displayName: string;
  countryCode: string;
  website: string;
  message: string;
  status: ShelterApplicationStatus;
  reviewNote: string;
  createdAt: string;
};

async function requireAdmin() {
  const profile = await getCurrentProfile();
  if (!profile) return { error: "Sign in required" as const };
  if (profile.role !== "admin") {
    return { error: "Admin only" as const };
  }
  return { profile };
}

const mockApps: AdminShelterApplicationRow[] = [];

export async function listPendingShelterApplications(): Promise<
  ActionResult<AdminShelterApplicationRow[]>
> {
  const gate = await requireAdmin();
  if ("error" in gate) return { ok: false, error: gate.error };

  if (useMock) {
    return {
      ok: true,
      data: mockApps.filter((a) => a.status === "pending"),
    };
  }

  const supabase = await createClient();
  if (!supabase) {
    return { ok: false, error: "Supabase is not configured" };
  }

  const { data, error } = await supabase
    .from("shelter_applications")
    .select(
      "id, applicant_id, handle, org_name, display_name, country_code, website, message, status, review_note, created_at",
    )
    .eq("status", "pending")
    .order("created_at", { ascending: true });

  if (error) {
    console.error("[listPendingShelterApplications]", error.message);
    return {
      ok: false,
      error:
        "Could not load applications. Run migration 20260925140000_shelter_applications.sql if you have not.",
    };
  }

  const items: AdminShelterApplicationRow[] = (data ?? []).map((r) => ({
    id: r.id,
    applicantId: r.applicant_id,
    handle: r.handle,
    orgName: r.org_name,
    displayName: r.display_name ?? "",
    countryCode: r.country_code ?? "XX",
    website: r.website ?? "",
    message: r.message ?? "",
    status: r.status as ShelterApplicationStatus,
    reviewNote: r.review_note ?? "",
    createdAt: r.created_at,
  }));

  return { ok: true, data: items };
}

export async function reviewShelterApplication(
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

  const { applicationId, decision, reviewNote } = parsed.data;
  const now = new Date().toISOString();

  if (useMock) {
    const idx = mockApps.findIndex((a) => a.id === applicationId);
    if (idx < 0) return { ok: false, error: "Application not found" };
    const row = mockApps[idx]!;
    if (row.status !== "pending") {
      return { ok: false, error: "Application is no longer open" };
    }
    mockApps[idx] = { ...row, status: decision, reviewNote };
    revalidatePath("/admin/shelter-applications");
    return { ok: true, data: { id: applicationId } };
  }

  const admin = createAdminClient();
  if (!admin) {
    return {
      ok: false,
      error: "SUPABASE_SERVICE_ROLE_KEY is required to approve shelters",
    };
  }

  const { data: app, error: fetchError } = await admin
    .from("shelter_applications")
    .select("id, applicant_id, handle, org_name, display_name, status")
    .eq("id", applicationId)
    .maybeSingle();

  if (fetchError || !app) {
    return { ok: false, error: "Application not found" };
  }
  if (app.status !== "pending") {
    return { ok: false, error: "Application is no longer open" };
  }

  if (decision === "approved") {
    const { error: rpcError } = await admin.rpc("admin_promote_shelter", {
      p_user_id: app.applicant_id,
      p_handle: app.handle,
      p_org_name: app.org_name,
      p_display_name: app.display_name || null,
    });

    if (rpcError) {
      console.error(
        "[reviewShelterApplication] promote failed",
        rpcError.message,
      );
      return {
        ok: false,
        error: `Could not promote shelter: ${rpcError.message}`,
      };
    }
  }

  const { error: updError } = await admin
    .from("shelter_applications")
    .update({
      status: decision,
      review_note: reviewNote,
      reviewed_by: gate.profile.id,
      reviewed_at: now,
    })
    .eq("id", applicationId);

  if (updError) {
    console.error("[reviewShelterApplication]", updError.message);
    return { ok: false, error: "Could not save application status" };
  }

  revalidatePath("/admin/shelter-applications");
  revalidatePath("/studio");
  revalidatePath("/me");
  revalidatePath(`/shelter/${app.handle}`);

  return { ok: true, data: { id: applicationId } };
}
