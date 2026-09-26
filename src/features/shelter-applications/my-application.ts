"use server";

import { getCurrentProfile } from "@/features/auth/session";
import { createClient } from "@/lib/supabase/server";
import type { ShelterApplicationStatus } from "./admin-actions";

const useMock = process.env.NEXT_PUBLIC_USE_MOCK_DATA !== "false";

export type MyShelterApplication = {
  id: string;
  handle: string;
  orgName: string;
  status: ShelterApplicationStatus;
  reviewNote: string;
  createdAt: string;
  reviewedAt: string | null;
};

/**
 * Latest shelter application for the signed-in user (if any).
 * Used on /me while role is still adopter during admin review.
 */
export async function getMyShelterApplication(): Promise<MyShelterApplication | null> {
  const profile = await getCurrentProfile();
  if (!profile) return null;

  // Already a shelter — application status is not the primary story on /me
  if (profile.role === "shelter" || profile.role === "admin") {
    return null;
  }

  if (useMock) {
    return null;
  }

  const supabase = await createClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("shelter_applications")
    .select(
      "id, handle, org_name, status, review_note, created_at, reviewed_at",
    )
    .eq("applicant_id", profile.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("[getMyShelterApplication]", error.message);
    return null;
  }
  if (!data) return null;

  return {
    id: data.id,
    handle: data.handle,
    orgName: data.org_name,
    status: data.status as ShelterApplicationStatus,
    reviewNote: data.review_note ?? "",
    createdAt: data.created_at,
    reviewedAt: data.reviewed_at,
  };
}
