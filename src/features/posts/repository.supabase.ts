import type { AnimalPost, CursorPage, FeedFilters, ShelterSummary } from "@/types/domain";
import type { ListPostsParams, PostsRepository } from "./repository";
import { createClient } from "@/lib/supabase/server";

/**
 * Supabase-backed posts repository (Phase 3).
 * Used when NEXT_PUBLIC_USE_MOCK_DATA=false and env is configured.
 * Join shape matches domain AnimalPost; media ordered by position.
 */

type DbShelter = {
  id: string;
  handle: string;
  org_name: string;
  avatar_url: string | null;
  verification_status: ShelterSummary["verificationStatus"];
  city: string;
  region: string;
  country_code: string;
};

type DbMedia = {
  id: string;
  storage_path: string;
  alt_text: string;
  position: number;
  width: number;
  height: number;
};

type DbPost = {
  id: string;
  name: string;
  species: AnimalPost["species"];
  breed: string;
  sex: AnimalPost["sex"];
  age_months: number;
  age_group: AnimalPost["ageGroup"];
  size: AnimalPost["size"];
  description: string;
  status: AnimalPost["status"];
  traits: string[];
  country_code: string;
  region: string;
  city: string;
  like_count: number;
  comment_count: number;
  created_at: string;
  shelters: DbShelter;
  post_media: DbMedia[];
};

function mediaUrl(path: string): string {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base) return path;
  // Public bucket convention: animal-media
  return `${base}/storage/v1/object/public/animal-media/${path}`;
}

function mapPost(row: DbPost): AnimalPost {
  const s = row.shelters;
  return {
    id: row.id,
    name: row.name,
    species: row.species,
    breed: row.breed,
    sex: row.sex,
    ageMonths: row.age_months,
    ageGroup: row.age_group,
    size: row.size,
    description: row.description,
    status: row.status,
    traits: row.traits ?? [],
    countryCode: row.country_code,
    region: row.region,
    city: row.city,
    likeCount: row.like_count,
    commentCount: row.comment_count,
    createdAt: row.created_at,
    media: (row.post_media ?? [])
      .slice()
      .sort((a, b) => a.position - b.position)
      .map((m) => ({
        id: m.id,
        url: mediaUrl(m.storage_path),
        altText: m.alt_text,
        position: m.position,
        width: m.width,
        height: m.height,
      })),
    shelter: {
      id: s.id,
      handle: s.handle,
      orgName: s.org_name,
      avatarUrl: s.avatar_url,
      verificationStatus: s.verification_status,
      city: s.city,
      region: s.region,
      countryCode: s.country_code,
    },
  };
}

// shelters has two FKs to profiles (profile_id + verified_by) — must disambiguate.
const selectShape = `
  id, name, species, breed, sex, age_months, age_group, size, description,
  status, traits, country_code, region, city, like_count, comment_count, created_at,
  shelters!inner (
    id, handle, org_name, verification_status, city, region, country_code,
    profiles!shelters_profile_id_fkey ( avatar_url )
  ),
  post_media ( id, storage_path, alt_text, position, width, height )
`;

// Flatten nested profile avatar if present
function normalizeRow(raw: Record<string, unknown>): DbPost {
  const shelters = raw.shelters as Record<string, unknown> & {
    profiles?: { avatar_url: string | null } | { avatar_url: string | null }[];
  };
  let avatar: string | null = null;
  const prof = shelters?.profiles;
  if (Array.isArray(prof)) avatar = prof[0]?.avatar_url ?? null;
  else if (prof) avatar = prof.avatar_url ?? null;

  return {
    ...(raw as unknown as DbPost),
    shelters: {
      id: String(shelters.id),
      handle: String(shelters.handle),
      org_name: String(shelters.org_name),
      avatar_url: avatar,
      verification_status: shelters.verification_status as ShelterSummary["verificationStatus"],
      city: String(shelters.city),
      region: String(shelters.region),
      country_code: String(shelters.country_code),
    },
  };
}

function applyFilters(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  query: any,
  filters?: FeedFilters,
) {
  let q = query;
  if (!filters) {
    return q.neq("status", "archived").neq("status", "adopted");
  }
  if (filters.status?.length) {
    q = q.in("status", filters.status);
  } else {
    q = q.in("status", ["available", "reserved"]);
  }
  if (filters.species?.length) q = q.in("species", filters.species);
  if (filters.size?.length) q = q.in("size", filters.size);
  if (filters.ageGroup?.length) q = q.in("age_group", filters.ageGroup);
  if (filters.sex?.length) q = q.in("sex", filters.sex);
  if (filters.countryCode) q = q.eq("country_code", filters.countryCode);
  if (filters.region) q = q.ilike("region", `%${filters.region}%`);
  if (filters.city) q = q.ilike("city", `%${filters.city}%`);
  if (filters.verifiedOnly) {
    q = q.eq("shelters.verification_status", "verified");
  }
  if (filters.q) {
    // Simple or-filter; full-text can replace later
    q = q.or(
      `name.ilike.%${filters.q}%,breed.ilike.%${filters.q}%,description.ilike.%${filters.q}%`,
    );
  }
  return q;
}

export const supabasePostsRepository: PostsRepository = {
  async list({ filters, cursor, limit = 12 }: ListPostsParams = {}): Promise<CursorPage<AnimalPost>> {
    const supabase = await createClient();
    if (!supabase) {
      throw new Error("Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and ANON_KEY.");
    }

    let query = supabase
      .from("animal_posts")
      .select(selectShape)
      .order("created_at", { ascending: false })
      .order("id", { ascending: false })
      .limit(limit);

    query = applyFilters(query, filters);

    if (cursor) {
      // Cursor is post id; fetch that row's created_at for keyset pagination
      const { data: cursorRow } = await supabase
        .from("animal_posts")
        .select("created_at, id")
        .eq("id", cursor)
        .maybeSingle();
      if (cursorRow) {
        query = query.or(
          `created_at.lt.${cursorRow.created_at},and(created_at.eq.${cursorRow.created_at},id.lt.${cursorRow.id})`,
        );
      }
    }

    const { data, error } = await query;
    if (error) throw error;

    const items = (data ?? []).map((row) => mapPost(normalizeRow(row as Record<string, unknown>)));
    const nextCursor =
      items.length === limit ? (items[items.length - 1]?.id ?? null) : null;

    return { items, nextCursor };
  },

  async getById(id: string): Promise<AnimalPost | null> {
    const supabase = await createClient();
    if (!supabase) {
      throw new Error("Supabase is not configured.");
    }

    const { data, error } = await supabase
      .from("animal_posts")
      .select(selectShape)
      .eq("id", id)
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;
    return mapPost(normalizeRow(data as Record<string, unknown>));
  },

  async listByShelter(shelterId: string): Promise<AnimalPost[]> {
    const supabase = await createClient();
    if (!supabase) {
      throw new Error("Supabase is not configured.");
    }

    const { data, error } = await supabase
      .from("animal_posts")
      .select(selectShape)
      .eq("shelter_id", shelterId)
      .neq("status", "archived")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return (data ?? []).map((row) => mapPost(normalizeRow(row as Record<string, unknown>)));
  },
};
