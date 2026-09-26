"use server";

import { revalidatePath } from "next/cache";
import { getCurrentProfile } from "@/features/auth/session";
import type { ActionResult } from "@/features/auth/types";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { rateLimit, RATE_LIMITS } from "@/lib/security";

const useMock = process.env.NEXT_PUBLIC_USE_MOCK_DATA !== "false";

async function resolveAdminProfileId(): Promise<
  { id: string; displayName: string } | null
> {
  const admin = createAdminClient();
  if (admin) {
    const { data } = await admin
      .from("profiles")
      .select("id, display_name")
      .eq("role", "admin")
      .is("deleted_at", null)
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();
    if (data) {
      return { id: data.id, displayName: data.display_name ?? "Homeward admin" };
    }
  }

  const supabase = await createClient();
  if (!supabase) return null;
  const { data } = await supabase
    .from("profiles")
    .select("id, display_name")
    .eq("role", "admin")
    .is("deleted_at", null)
    .limit(1)
    .maybeSingle();
  if (!data) return null;
  return { id: data.id, displayName: data.display_name ?? "Homeward admin" };
}

/**
 * Open (or resume) a support chat with a Homeward admin about verification.
 * Conversation peer is stored in shelter_profile_id (admin profile).
 */
export async function startVerificationSupportChat(input?: {
  orgName?: string;
  handle?: string;
  verificationStatus?: string;
}): Promise<ActionResult<{ id: string }>> {
  const profile = await getCurrentProfile();
  if (!profile) return { ok: false, error: "Sign in required" };
  if (profile.role !== "shelter" && profile.role !== "admin") {
    return { ok: false, error: "Only rescue accounts can contact support this way" };
  }

  const limited = rateLimit(`start-chat:${profile.id}`, RATE_LIMITS.startChat);
  if (!limited.ok) {
    return {
      ok: false,
      error: `Too many new chats. Wait about ${limited.retryAfterSec}s and try again.`,
    };
  }

  const adminPeer = await resolveAdminProfileId();
  if (!adminPeer) {
    return {
      ok: false,
      error:
        "No admin account is available yet. Try again later or email support.",
    };
  }

  if (adminPeer.id === profile.id) {
    return { ok: false, error: "You are already an admin" };
  }

  const org = input?.orgName?.trim() || profile.displayName;
  const handle = input?.handle?.trim();
  const status = input?.verificationStatus?.trim() || "unknown";

  const body = [
    `Hi Homeward team — this is ${org}${handle ? ` (@${handle})` : ""}.`,
    `I'm writing about our verification request (current status: ${status}).`,
    `Studio verification page: /studio/verification`,
    ``,
    `Please let me know if you need more documents or information.`,
  ].join("\n");

  if (useMock) {
    // Reuse normal start path shape: synthetic id
    const id = `support-${profile.id.slice(0, 8)}`;
    return { ok: true, data: { id } };
  }

  const supabase = await createClient();
  if (!supabase) return { ok: false, error: "Supabase is not configured" };

  const { data: existing } = await supabase
    .from("conversations")
    .select("id")
    .eq("adopter_id", profile.id)
    .eq("shelter_profile_id", adminPeer.id)
    .maybeSingle();

  let conversationId: string;
  if (existing?.id) {
    conversationId = existing.id;
  } else {
    const { data: created, error } = await supabase
      .from("conversations")
      .insert({
        adopter_id: profile.id,
        shelter_profile_id: adminPeer.id,
        post_id: null,
        status: "open",
      })
      .select("id")
      .single();

    if (error || !created?.id) {
      console.error("[startVerificationSupportChat]", error?.message);
      return {
        ok: false,
        error:
          error?.message?.includes("policy") || error?.code === "42501"
            ? "Could not open support chat. Run migration 20260926170000_support_chat_admin.sql."
            : "Could not open support chat",
      };
    }
    conversationId = created.id;
  }

  await supabase.from("messages").insert({
    conversation_id: conversationId,
    sender_id: profile.id,
    body,
  });

  revalidatePath("/messages");
  revalidatePath(`/messages/${conversationId}`);
  return { ok: true, data: { id: conversationId } };
}
