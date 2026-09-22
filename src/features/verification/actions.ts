"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { getCurrentProfile } from "@/features/auth/session";
import type { ActionResult } from "@/features/auth/types";
import { getShelterForProfile } from "@/features/shelters";
import { createClient } from "@/lib/supabase/server";
import {
  verificationRequestSchema,
  type VerificationRequest,
} from "./schema";
import {
  addMockVerificationRequest,
  listMockVerificationByShelter,
} from "./mock-store";

const useMock = process.env.NEXT_PUBLIC_USE_MOCK_DATA !== "false";

export async function submitVerificationRequest(
  raw: unknown,
): Promise<ActionResult<{ id: string }>> {
  const profile = await getCurrentProfile();
  if (!profile) return { ok: false, error: "Sign in required" };
  if (profile.role !== "shelter" && profile.role !== "admin") {
    return { ok: false, error: "Only rescue accounts can request verification" };
  }

  const shelter = await getShelterForProfile(profile.id);
  if (!shelter) {
    return { ok: false, error: "No shelter profile linked to this account" };
  }

  if (shelter.verificationStatus === "verified") {
    return { ok: false, error: "Your rescue is already verified" };
  }
  if (shelter.verificationStatus === "pending") {
    return { ok: false, error: "A verification request is already pending" };
  }

  const parsed = verificationRequestSchema.safeParse(raw);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return { ok: false, error: first?.message ?? "Invalid form data" };
  }

  const data = parsed.data;

  if (useMock) {
    const req: VerificationRequest = {
      id: `vr-${randomUUID().slice(0, 8)}`,
      shelterId: shelter.id,
      status: "pending",
      notes: data.notes,
      documents: data.documents,
      reviewNote: "",
      createdAt: new Date().toISOString(),
      reviewedAt: null,
    };
    addMockVerificationRequest(req);
    revalidatePath("/studio/verification");
    revalidatePath("/studio/profile");
    revalidatePath(`/shelter/${shelter.handle}`);
    return { ok: true, data: { id: req.id } };
  }

  const supabase = await createClient();
  if (!supabase) {
    return { ok: false, error: "Supabase is not configured" };
  }

  const { data: row, error } = await supabase
    .from("verification_requests")
    .insert({
      shelter_id: shelter.id,
      status: "pending",
      notes: data.notes,
      documents: data.documents,
    })
    .select("id")
    .single();

  if (error || !row) {
    console.error("[submitVerificationRequest]", error?.message);
    return { ok: false, error: "Could not submit request. Try again." };
  }

  // Mirror status on shelter row (admin will set verified on approve)
  await supabase
    .from("shelters")
    .update({ verification_status: "pending" })
    .eq("id", shelter.id)
    .eq("profile_id", profile.id);

  revalidatePath("/studio/verification");
  revalidatePath("/studio/profile");
  revalidatePath(`/shelter/${shelter.handle}`);
  return { ok: true, data: { id: row.id } };
}

export async function listOwnVerificationRequests(): Promise<
  ActionResult<VerificationRequest[]>
> {
  const profile = await getCurrentProfile();
  if (!profile) return { ok: false, error: "Sign in required" };

  const shelter = await getShelterForProfile(profile.id);
  if (!shelter) {
    return { ok: false, error: "No shelter profile" };
  }

  if (useMock) {
    return {
      ok: true,
      data: listMockVerificationByShelter(shelter.id),
    };
  }

  const supabase = await createClient();
  if (!supabase) {
    return { ok: false, error: "Supabase is not configured" };
  }

  const { data, error } = await supabase
    .from("verification_requests")
    .select(
      "id, shelter_id, status, notes, documents, review_note, created_at, reviewed_at",
    )
    .eq("shelter_id", shelter.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[listOwnVerificationRequests]", error.message);
    return { ok: false, error: "Could not load requests" };
  }

  const items: VerificationRequest[] = (data ?? []).map((r) => ({
    id: r.id,
    shelterId: r.shelter_id,
    status: r.status,
    notes: r.notes ?? "",
    documents: Array.isArray(r.documents) ? r.documents : [],
    reviewNote: r.review_note ?? "",
    createdAt: r.created_at,
    reviewedAt: r.reviewed_at,
  }));

  return { ok: true, data: items };
}
