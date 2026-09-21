"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/features/auth/session";
import type { ActionResult } from "@/features/auth/types";
import { parseFeedFilters } from "@/features/filters/schema";
import { saveSearchSchema } from "./schema";
import type { SavedSearch } from "./types";

const useMock = process.env.NEXT_PUBLIC_USE_MOCK_DATA !== "false";

function mapRow(row: {
  id: string;
  name: string;
  filters: unknown;
  notify: boolean;
  created_at: string;
}): SavedSearch {
  const raw =
    row.filters && typeof row.filters === "object" && !Array.isArray(row.filters)
      ? (row.filters as Record<string, string | string[] | undefined>)
      : {};
  return {
    id: row.id,
    name: row.name,
    filters: parseFeedFilters(raw),
    notify: row.notify,
    createdAt: row.created_at,
  };
}

export async function listSavedSearches(): Promise<SavedSearch[]> {
  const profile = await getCurrentProfile();
  if (!profile) return [];

  if (useMock) return [];

  const supabase = await createClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("saved_searches")
    .select("id, name, filters, notify, created_at")
    .eq("user_id", profile.id)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    console.error("[saved_searches] list", error.message);
    return [];
  }

  return (data ?? []).map(mapRow);
}

export type SaveSearchResult = {
  search: SavedSearch;
  mock: boolean;
};

export async function saveSearch(
  input: unknown,
): Promise<ActionResult<SaveSearchResult>> {
  const parsed = saveSearchSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  const profile = await getCurrentProfile();
  if (!profile) {
    return { ok: false, error: "Sign in to save a search" };
  }

  if (profile.role === "shelter") {
    return { ok: false, error: "Saved searches are for adopters" };
  }

  const { name, filters, notify } = parsed.data;

  // Strip empty filters object noise for storage
  const filterPayload: Record<string, unknown> = {};
  if (filters.q) filterPayload.q = filters.q;
  if (filters.species?.length) filterPayload.species = filters.species.join(",");
  if (filters.size?.length) filterPayload.size = filters.size.join(",");
  if (filters.ageGroup?.length)
    filterPayload.ageGroup = filters.ageGroup.join(",");
  if (filters.sex?.length) filterPayload.sex = filters.sex.join(",");
  if (filters.status?.length) filterPayload.status = filters.status.join(",");
  if (filters.country) filterPayload.country = filters.country;
  if (filters.region) filterPayload.region = filters.region;
  if (filters.city) filterPayload.city = filters.city;
  if (filters.verified) filterPayload.verified = "1";

  if (Object.keys(filterPayload).length === 0) {
    return { ok: false, error: "Apply at least one filter before saving" };
  }

  if (useMock) {
    const search: SavedSearch = {
      id: `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name,
      filters: parseFeedFilters(filterPayload as Record<string, string>),
      notify: Boolean(notify),
      createdAt: new Date().toISOString(),
    };
    return { ok: true, data: { search, mock: true } };
  }

  const supabase = await createClient();
  if (!supabase) {
    return { ok: false, error: "Supabase is not configured" };
  }

  const { data, error } = await supabase
    .from("saved_searches")
    .insert({
      user_id: profile.id,
      name,
      filters: filterPayload,
      notify: Boolean(notify),
    })
    .select("id, name, filters, notify, created_at")
    .single();

  if (error || !data) {
    console.error("[saved_searches] insert", error?.message);
    return { ok: false, error: "Could not save this search" };
  }

  return { ok: true, data: { search: mapRow(data), mock: false } };
}

export async function deleteSavedSearch(
  id: string,
): Promise<ActionResult> {
  const parsed = z.string().min(1).max(80).safeParse(id);
  if (!parsed.success) return { ok: false, error: "Invalid search" };

  const profile = await getCurrentProfile();
  if (!profile) return { ok: false, error: "Sign in required" };

  if (useMock || id.startsWith("local-")) {
    return { ok: true, data: undefined };
  }

  const supabase = await createClient();
  if (!supabase) return { ok: false, error: "Supabase is not configured" };

  const { error } = await supabase
    .from("saved_searches")
    .delete()
    .eq("id", id)
    .eq("user_id", profile.id);

  if (error) {
    console.error("[saved_searches] delete", error.message);
    return { ok: false, error: "Could not delete search" };
  }

  return { ok: true, data: undefined };
}
