"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/features/auth/session";
import type { ActionResult } from "@/features/auth/types";

const postIdSchema = z.string().min(1).max(80);

export type LikeState = {
  liked: boolean;
  likeCount: number;
};

const useMock = process.env.NEXT_PUBLIC_USE_MOCK_DATA !== "false";

function isUuid(id: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    id,
  );
}

/**
 * Toggle like for the current user (adopter, shelter, or admin).
 * - Real mode: Postgres likes table (RLS + count trigger).
 * - Mock mode: auth-gated only; client keeps the heart state in localStorage
 *   because mock post ids are not real UUIDs in animal_posts.
 */
export async function toggleLike(
  postId: string,
  currentlyLiked: boolean,
  currentCount: number,
): Promise<ActionResult<LikeState>> {
  const parsed = postIdSchema.safeParse(postId);
  if (!parsed.success) {
    return { ok: false, error: "Invalid post" };
  }

  const profile = await getCurrentProfile();
  if (!profile) {
    return { ok: false, error: "Sign in to like animals" };
  }

  const nextLiked = !currentlyLiked;
  const nextCount = Math.max(0, currentCount + (nextLiked ? 1 : -1));

  // Mock feed posts (ids like "a1") — no DB row to reference.
  if (useMock || !isUuid(parsed.data)) {
    return { ok: true, data: { liked: nextLiked, likeCount: nextCount } };
  }

  const supabase = await createClient();
  if (!supabase) {
    return { ok: false, error: "Supabase is not configured" };
  }

  if (nextLiked) {
    const { error } = await supabase.from("likes").insert({
      user_id: profile.id,
      post_id: parsed.data,
    });
    if (error) {
      // Unique violation = already liked (idempotent)
      if (error.code === "23505") {
        return { ok: true, data: { liked: true, likeCount: currentCount } };
      }
      console.error("[likes] insert", error.message);
      return { ok: false, error: "Could not like this post" };
    }
  } else {
    const { error } = await supabase
      .from("likes")
      .delete()
      .eq("user_id", profile.id)
      .eq("post_id", parsed.data);
    if (error) {
      console.error("[likes] delete", error.message);
      return { ok: false, error: "Could not remove like" };
    }
  }

  // Read authoritative count after trigger
  const { data: post } = await supabase
    .from("animal_posts")
    .select("like_count")
    .eq("id", parsed.data)
    .maybeSingle();

  return {
    ok: true,
    data: {
      liked: nextLiked,
      likeCount: post?.like_count ?? nextCount,
    },
  };
}

/** Whether the current user has liked this post (real mode only). */
export async function getLikedByMe(postId: string): Promise<boolean> {
  const profile = await getCurrentProfile();
  if (!profile) return false;
  if (useMock || !isUuid(postId)) return false;

  const supabase = await createClient();
  if (!supabase) return false;

  const { data } = await supabase
    .from("likes")
    .select("post_id")
    .eq("user_id", profile.id)
    .eq("post_id", postId)
    .maybeSingle();

  return Boolean(data);
}
