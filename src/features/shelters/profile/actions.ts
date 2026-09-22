"use server";

import { revalidatePath } from "next/cache";
import { getCurrentProfile } from "@/features/auth/session";
import type { ActionResult } from "@/features/auth/types";
import { getShelterForProfile } from "@/features/shelters/get-for-profile";
import { createClient } from "@/lib/supabase/server";
import type { Shelter } from "@/types/domain";
import { shelterProfileSchema } from "./schema";
import { setMockShelterOverride } from "./mock-store";

const useMock = process.env.NEXT_PUBLIC_USE_MOCK_DATA !== "false";

export async function updateShelterProfile(
  raw: unknown,
): Promise<ActionResult<{ id: string }>> {
  const profile = await getCurrentProfile();
  if (!profile) {
    return { ok: false, error: "Sign in required" };
  }
  if (profile.role !== "shelter" && profile.role !== "admin") {
    return { ok: false, error: "Only rescue accounts can edit a shelter profile" };
  }

  const shelter = await getShelterForProfile(profile.id);
  if (!shelter) {
    return { ok: false, error: "No shelter profile linked to this account" };
  }

  const parsed = shelterProfileSchema.safeParse(raw);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return { ok: false, error: first?.message ?? "Invalid form data" };
  }

  const data = parsed.data;
  const avatarUrl =
    data.avatarUrl === undefined
      ? shelter.avatarUrl
      : data.avatarUrl === "" || data.avatarUrl === null
        ? null
        : data.avatarUrl;

  if (useMock) {
    const next: Shelter = {
      ...shelter,
      orgName: data.orgName,
      bio: data.bio,
      countryCode: data.countryCode,
      region: data.region,
      city: data.city,
      links: data.links,
      avatarUrl,
    };
    setMockShelterOverride(next);
    revalidatePath("/studio/profile");
    revalidatePath(`/shelter/${shelter.handle}`);
    revalidatePath("/studio");
    return { ok: true, data: { id: shelter.id } };
  }

  const supabase = await createClient();
  if (!supabase) {
    return { ok: false, error: "Supabase is not configured" };
  }

  const { error: shelterError } = await supabase
    .from("shelters")
    .update({
      org_name: data.orgName,
      bio: data.bio,
      country_code: data.countryCode,
      region: data.region,
      city: data.city,
      links: data.links,
    })
    .eq("id", shelter.id)
    .eq("profile_id", profile.id);

  if (shelterError) {
    console.error("[updateShelterProfile]", shelterError.message);
    return { ok: false, error: "Could not save profile. Try again." };
  }

  // Avatar lives on profiles
  if (data.avatarUrl !== undefined) {
    const { error: avatarError } = await supabase
      .from("profiles")
      .update({ avatar_url: avatarUrl })
      .eq("id", profile.id);

    if (avatarError) {
      console.error("[updateShelterProfile] avatar", avatarError.message);
      // Non-fatal: shelter fields already saved
    }
  }

  revalidatePath("/studio/profile");
  revalidatePath(`/shelter/${shelter.handle}`);
  revalidatePath("/studio");
  return { ok: true, data: { id: shelter.id } };
}
