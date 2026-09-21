import type { Shelter } from "@/types/domain";
import type { SheltersRepository } from "./repository";
import { createClient } from "@/lib/supabase/server";

type DbShelter = {
  id: string;
  handle: string;
  org_name: string;
  bio: string;
  links: { label: string; url: string }[];
  country_code: string;
  region: string;
  city: string;
  verification_status: Shelter["verificationStatus"];
  profiles: { avatar_url: string | null } | { avatar_url: string | null }[] | null;
};

function avatarOf(row: DbShelter): string | null {
  const p = row.profiles;
  if (!p) return null;
  if (Array.isArray(p)) return p[0]?.avatar_url ?? null;
  return p.avatar_url;
}

function mapShelter(row: DbShelter, animalCount = 0): Shelter {
  return {
    id: row.id,
    handle: row.handle,
    orgName: row.org_name,
    avatarUrl: avatarOf(row),
    verificationStatus: row.verification_status,
    city: row.city,
    region: row.region,
    countryCode: row.country_code,
    bio: row.bio,
    links: Array.isArray(row.links) ? row.links : [],
    animalCount,
  };
}

const selectShape = `
  id, handle, org_name, bio, links, country_code, region, city, verification_status,
  profiles ( avatar_url )
`;

export const supabaseSheltersRepository: SheltersRepository = {
  async list(): Promise<Shelter[]> {
    const supabase = await createClient();
    if (!supabase) throw new Error("Supabase is not configured.");

    const { data, error } = await supabase.from("shelters").select(selectShape);
    if (error) throw error;
    return (data ?? []).map((row) => mapShelter(row as unknown as DbShelter));
  },

  async getById(id: string): Promise<Shelter | null> {
    const supabase = await createClient();
    if (!supabase) throw new Error("Supabase is not configured.");

    const { data, error } = await supabase
      .from("shelters")
      .select(selectShape)
      .eq("id", id)
      .maybeSingle();
    if (error) throw error;
    if (!data) return null;
    return mapShelter(data as unknown as DbShelter);
  },

  async getByHandle(handle: string): Promise<Shelter | null> {
    const supabase = await createClient();
    if (!supabase) throw new Error("Supabase is not configured.");

    const { data, error } = await supabase
      .from("shelters")
      .select(selectShape)
      .eq("handle", handle)
      .maybeSingle();
    if (error) throw error;
    if (!data) return null;

    const { count } = await supabase
      .from("animal_posts")
      .select("id", { count: "exact", head: true })
      .eq("shelter_id", data.id)
      .neq("status", "archived");

    return mapShelter(data as unknown as DbShelter, count ?? 0);
  },
};
