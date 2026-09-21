"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/features/auth/session";
import type { ActionResult } from "@/features/auth/types";
import { addCommentSchema } from "./schema";
import type { CommentItem } from "./types";

const useMock = process.env.NEXT_PUBLIC_USE_MOCK_DATA !== "false";

function isUuid(id: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    id,
  );
}

function mapRow(row: {
  id: string;
  post_id: string;
  user_id: string;
  body: string;
  created_at: string;
  profiles?: { display_name: string } | { display_name: string }[] | null;
}): CommentItem {
  const profile = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;
  return {
    id: row.id,
    postId: row.post_id,
    userId: row.user_id,
    displayName: profile?.display_name ?? "Member",
    body: row.body,
    createdAt: row.created_at,
  };
}

/** Load public comments for a post (real mode). Mock mode returns []. */
export async function listComments(postId: string): Promise<CommentItem[]> {
  if (useMock || !isUuid(postId)) return [];

  const supabase = await createClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("comments")
    .select("id, post_id, user_id, body, created_at, profiles(display_name)")
    .eq("post_id", postId)
    .is("hidden_at", null)
    .order("created_at", { ascending: true })
    .limit(100);

  if (error) {
    console.error("[comments] list", error.message);
    return [];
  }

  return (data ?? []).map(mapRow);
}

export type AddCommentResult = {
  comment: CommentItem;
  /** True when client should also persist to localStorage (mock ids) */
  mock: boolean;
};

export async function addComment(
  input: unknown,
): Promise<ActionResult<AddCommentResult>> {
  const parsed = addCommentSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Invalid comment",
    };
  }

  const profile = await getCurrentProfile();
  if (!profile) {
    return { ok: false, error: "Sign in to comment" };
  }

  const { postId, body } = parsed.data;

  // Mock post ids — auth only; client stores the comment locally
  if (useMock || !isUuid(postId)) {
    const comment: CommentItem = {
      id: `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      postId,
      userId: profile.id,
      displayName: profile.displayName,
      body,
      createdAt: new Date().toISOString(),
    };
    return { ok: true, data: { comment, mock: true } };
  }

  const supabase = await createClient();
  if (!supabase) {
    return { ok: false, error: "Supabase is not configured" };
  }

  const { data, error } = await supabase
    .from("comments")
    .insert({
      post_id: postId,
      user_id: profile.id,
      body,
    })
    .select("id, post_id, user_id, body, created_at")
    .single();

  if (error || !data) {
    console.error("[comments] insert", error?.message);
    return { ok: false, error: "Could not post your comment" };
  }

  return {
    ok: true,
    data: {
      comment: {
        id: data.id,
        postId: data.post_id,
        userId: data.user_id,
        displayName: profile.displayName,
        body: data.body,
        createdAt: data.created_at,
      },
      mock: false,
    },
  };
}

export async function deleteComment(
  commentId: string,
  postId: string,
): Promise<ActionResult> {
  const id = z.string().min(1).max(80).safeParse(commentId);
  if (!id.success) return { ok: false, error: "Invalid comment" };

  const profile = await getCurrentProfile();
  if (!profile) return { ok: false, error: "Sign in required" };

  if (useMock || !isUuid(postId) || commentId.startsWith("local-")) {
    return { ok: true, data: undefined };
  }

  const supabase = await createClient();
  if (!supabase) return { ok: false, error: "Supabase is not configured" };

  const { error } = await supabase
    .from("comments")
    .delete()
    .eq("id", commentId)
    .eq("user_id", profile.id);

  if (error) {
    console.error("[comments] delete", error.message);
    return { ok: false, error: "Could not delete comment" };
  }

  return { ok: true, data: undefined };
}
