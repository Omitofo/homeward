"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentProfile } from "./session";
import type { ActionResult } from "./types";

/**
 * GDPR-style data export: profile + activity the user can reasonably access.
 * Returns JSON-serializable payload for the client to download.
 */
export async function exportAccountData(): Promise<
  ActionResult<{ exportedAt: string; data: Record<string, unknown> }>
> {
  const profile = await getCurrentProfile();
  if (!profile) {
    return { ok: false, error: "Sign in required" };
  }

  const supabase = await createClient();
  if (!supabase) {
    // Mock / unconfigured: export what we know from session
    return {
      ok: true,
      data: {
        exportedAt: new Date().toISOString(),
        data: {
          profile: {
            id: profile.id,
            email: profile.email,
            displayName: profile.displayName,
            role: profile.role,
            avatarUrl: profile.avatarUrl,
          },
          note: "Live database not configured; session profile only.",
        },
      },
    };
  }

  const userId = profile.id;

  const [
    likesRes,
    commentsRes,
    searchesRes,
    conversationsRes,
    shelterRes,
  ] = await Promise.all([
    supabase.from("likes").select("post_id, created_at").eq("user_id", userId),
    supabase
      .from("comments")
      .select("id, post_id, body, created_at, hidden_at")
      .eq("user_id", userId),
    supabase
      .from("saved_searches")
      .select("id, name, filters, created_at")
      .eq("user_id", userId),
    supabase
      .from("conversations")
      .select("id, adopter_id, shelter_profile_id, post_id, created_at, updated_at")
      .or(`adopter_id.eq.${userId},shelter_profile_id.eq.${userId}`),
    supabase
      .from("shelters")
      .select(
        "id, handle, org_name, bio, links, country_code, region, city, verification_status, created_at",
      )
      .eq("profile_id", userId)
      .maybeSingle(),
  ]);

  const conversationIds = (conversationsRes.data ?? []).map((c) => c.id);
  let messages: unknown[] = [];
  if (conversationIds.length > 0) {
    const { data: msgs } = await supabase
      .from("messages")
      .select("id, conversation_id, sender_id, body, created_at, read_at")
      .in("conversation_id", conversationIds)
      .eq("sender_id", userId);
    messages = msgs ?? [];
  }

  return {
    ok: true,
    data: {
      exportedAt: new Date().toISOString(),
      data: {
        profile: {
          id: profile.id,
          email: profile.email,
          displayName: profile.displayName,
          role: profile.role,
          avatarUrl: profile.avatarUrl,
        },
        likes: likesRes.data ?? [],
        comments: commentsRes.data ?? [],
        savedSearches: searchesRes.data ?? [],
        conversations: conversationsRes.data ?? [],
        messagesSent: messages,
        shelter: shelterRes.data ?? null,
      },
    },
  };
}

/**
 * Soft-delete account: mark profile deleted_at, archive own posts if shelter,
 * sign out. Full auth.users purge can be done later by ops/admin.
 */
export async function deleteAccount(): Promise<ActionResult> {
  const profile = await getCurrentProfile();
  if (!profile) {
    return { ok: false, error: "Sign in required" };
  }

  const supabase = await createClient();
  const now = new Date().toISOString();

  if (!supabase) {
    // Nothing to persist in mock mode — still sign out path via redirect
    redirect("/");
  }

  const { error: profileError } = await supabase
    .from("profiles")
    .update({ deleted_at: now, display_name: "Deleted user" })
    .eq("id", profile.id);

  if (profileError) {
    // Role lock trigger only blocks role changes; deleted_at should be fine.
    // If RLS blocks, try service role for self-service delete.
    const admin = createAdminClient();
    if (admin) {
      const { error: adminErr } = await admin
        .from("profiles")
        .update({ deleted_at: now, display_name: "Deleted user" })
        .eq("id", profile.id);
      if (adminErr) {
        console.error("[deleteAccount] profile", adminErr.message);
        return { ok: false, error: "Could not delete account. Try again or contact support." };
      }
    } else {
      console.error("[deleteAccount] profile", profileError.message);
      return { ok: false, error: "Could not delete account. Try again or contact support." };
    }
  }

  if (profile.role === "shelter") {
    const { data: shelter } = await supabase
      .from("shelters")
      .select("id")
      .eq("profile_id", profile.id)
      .maybeSingle();

    if (shelter?.id) {
      await supabase
        .from("animal_posts")
        .update({ status: "archived" })
        .eq("shelter_id", shelter.id);
    }
  }

  await supabase.auth.signOut();
  redirect("/");
}
