import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/features/auth";
import type { AuthProfile } from "@/features/auth";
import { getShelterForProfile } from "@/features/shelters";
import type { Shelter } from "@/types/domain";

export type ShelterContext = {
  profile: AuthProfile;
  shelter: Shelter;
};

/**
 * Server-only guard for /studio/*.
 * Redirects visitors to login; returns null when signed in but not a shelter
 * (caller renders a blocked state). When ok, returns profile + linked shelter.
 */
export async function requireShelterContext(): Promise<
  ShelterContext | { profile: AuthProfile; shelter: null } | null
> {
  const profile = await getCurrentProfile();
  if (!profile) {
    redirect("/login?next=/studio");
  }

  if (profile.role !== "shelter" && profile.role !== "admin") {
    return { profile, shelter: null };
  }

  const shelter = await getShelterForProfile(profile.id);
  return { profile, shelter };
}
