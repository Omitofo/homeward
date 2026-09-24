"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/features/auth/session";
import type { ActionResult } from "@/features/auth/types";
import { postsRepository } from "@/features/posts";
import type { AnimalPost } from "@/types/domain";

const postIdSchema = z.string().min(1).max(80);

export type SaveState = {
  saved: boolean;
};

const useMock = process.env.NEXT_PUBLIC_USE_MOCK_DATA !== "false";

function isUuid(id: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    id,
  );
}

/**
 * Toggle save for the current user.
 * - Real mode: Postgres saved_animals table (RLS).
 * - Mock mode: client keeps state in localStorage (non-UUID mock ids).
 */
export async function toggleSave(
  postId: string,
  currentlySaved: boolean,
): Promise<ActionResult<SaveState>> {
  const parsed = postIdSchema.safeParse(postId);
  if (!parsed.success) {
    return { ok: false, error: "Invalid post" };
  }

  const profile = await getCurrentProfile();
  if (!profile) {
    return { ok: false, error: "Sign in to save animals" };
  }

  if (profile.role === "shelter") {
    return { ok: false, error: "Shelter accounts cannot save animals" };
  }

  const nextSaved = !currentlySaved;

  if (useMock || !isUuid(parsed.data)) {
    return { ok: true, data: { saved: nextSaved } };
  }

  const supabase = await createClient();
  if (!supabase) {
    return { ok: false, error: "Supabase is not configured" };
  }

  if (nextSaved) {
    const { error } = await supabase.from("saved_animals").insert({
      user_id: profile.id,
      post_id: parsed.data,
    });
    if (error) {
      if (error.code === "23505") {
        return { ok: true, data: { saved: true } };
      }
      console.error("[saved_animals] insert", error.message);
      return { ok: false, error: "Could not save this animal" };
    }
  } else {
    const { error } = await supabase
      .from("saved_animals")
      .delete()
      .eq("user_id", profile.id)
      .eq("post_id", parsed.data);
    if (error) {
      console.error("[saved_animals] delete", error.message);
      return { ok: false, error: "Could not remove save" };
    }
  }

  return { ok: true, data: { saved: nextSaved } };
}

/** Whether the current user has saved this post (real mode only). */
export async function getSavedByMe(postId: string): Promise<boolean> {
  const profile = await getCurrentProfile();
  if (!profile) return false;
  if (useMock || !isUuid(postId)) return false;

  const supabase = await createClient();
  if (!supabase) return false;

  const { data } = await supabase
    .from("saved_animals")
    .select("post_id")
    .eq("user_id", profile.id)
    .eq("post_id", postId)
    .maybeSingle();

  return Boolean(data);
}

/** List full animal posts the current user has saved (newest first). */
export async function listSavedAnimals(): Promise<AnimalPost[]> {
  const profile = await getCurrentProfile();
  if (!profile) return [];

  if (useMock) return [];

  const supabase = await createClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("saved_animals")
    .select("post_id, created_at")
    .eq("user_id", profile.id)
    .order("created_at", { ascending: false })
    .limit(48);

  if (error) {
    console.error("[saved_animals] list", error.message);
    return [];
  }

  const ids = (data ?? []).map((r) => r.post_id as string);
  if (ids.length === 0) return [];

  const posts: AnimalPost[] = [];
  for (const id of ids) {
    const post = await postsRepository.getById(id);
    if (post) posts.push(post);
  }
  return posts;
}

/** List full animal posts the current user has liked (newest first). */
export async function listLikedAnimals(): Promise<AnimalPost[]> {
  const profile = await getCurrentProfile();
  if (!profile) return [];

  if (useMock) return [];

  const supabase = await createClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("likes")
    .select("post_id, created_at")
    .eq("user_id", profile.id)
    .order("created_at", { ascending: false })
    .limit(48);

  if (error) {
    console.error("[likes] list for me", error.message);
    return [];
  }

  const ids = (data ?? []).map((r) => r.post_id as string);
  if (ids.length === 0) return [];

  const posts: AnimalPost[] = [];
  for (const id of ids) {
    const post = await postsRepository.getById(id);
    if (post) posts.push(post);
  }
  return posts;
}
