import type { Shelter } from "@/types/domain";
import { createClient } from "@/lib/supabase/server";
import { mockShelters } from "@/data/mock/shelters";

const useMock = process.env.NEXT_PUBLIC_USE_MOCK_DATA !== "false";

/**
 * Resolve the shelter row owned by this profile.
 * Mock mode: demo shelter (Paws Haven) so studio UI is usable without a real DB link.
 * Real mode: shelters.profile_id = user id.
 */
export async function getShelterForProfile(
  profileId: string,
): Promise<Shelter | null> {
  if (useMock) {
    // Deterministic demo owner for any shelter-role session in mock mode.
    void profileId;
    return mockShelters[0] ?? null;
  }

  const supabase = await createClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("shelters")
    .select(
      `
      id, handle, org_name, bio, links, country_code, region, city, verification_status,
      profiles ( avatar_url )
    `,
    )
    .eq("profile_id", profileId)
    .maybeSingle();

  if (error || !data) return null;

  const profiles = data.profiles as
    | { avatar_url: string | null }
    | { avatar_url: string | null }[]
    | null;
  const avatarUrl = Array.isArray(profiles)
    ? (profiles[0]?.avatar_url ?? null)
    : (profiles?.avatar_url ?? null);

  const { count } = await supabase
    .from("animal_posts")
    .select("id", { count: "exact", head: true })
    .eq("shelter_id", data.id)
    .neq("status", "archived");

  return {
    id: data.id,
    handle: data.handle,
    orgName: data.org_name,
    avatarUrl,
    verificationStatus: data.verification_status,
    city: data.city,
    region: data.region,
    countryCode: data.country_code,
    bio: data.bio ?? "",
    links: Array.isArray(data.links) ? data.links : [],
    animalCount: count ?? 0,
  };
}
