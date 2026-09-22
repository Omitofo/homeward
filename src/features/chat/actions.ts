"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { getCurrentProfile } from "@/features/auth/session";
import type { ActionResult } from "@/features/auth/types";
import { createClient } from "@/lib/supabase/server";
import {
  sendMessageSchema,
  startConversationSchema,
  type ChatMessage,
  type ConversationSummary,
} from "./schema";
import {
  appendMockMessage,
  findMockConversation,
  getMockConversation,
  listMockConversationsForUser,
  upsertMockConversation,
} from "./mock-store";

const useMock = process.env.NEXT_PUBLIC_USE_MOCK_DATA !== "false";

export async function listConversations(): Promise<
  ActionResult<ConversationSummary[]>
> {
  const profile = await getCurrentProfile();
  if (!profile) return { ok: false, error: "Sign in required" };

  if (useMock) {
    return {
      ok: true,
      data: listMockConversationsForUser(profile.id),
    };
  }

  const supabase = await createClient();
  if (!supabase) return { ok: false, error: "Supabase is not configured" };

  const { data, error } = await supabase
    .from("conversations")
    .select(
      `
      id, adopter_id, shelter_profile_id, post_id, created_at, updated_at,
      messages ( body, created_at, sender_id, read_at )
    `,
    )
    .or(
      `adopter_id.eq.${profile.id},shelter_profile_id.eq.${profile.id}`,
    )
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("[listConversations]", error.message);
    return { ok: false, error: "Could not load conversations" };
  }

  const items: ConversationSummary[] = await Promise.all(
    (data ?? []).map(async (row) => {
      const peerId =
        row.adopter_id === profile.id
          ? row.shelter_profile_id
          : row.adopter_id;

      const { data: peer } = await supabase
        .from("profiles")
        .select("display_name")
        .eq("id", peerId)
        .maybeSingle();

      const msgs = (row.messages ?? []) as {
        body: string;
        created_at: string;
        sender_id: string;
        read_at: string | null;
      }[];
      msgs.sort((a, b) => a.created_at.localeCompare(b.created_at));
      const last = msgs[msgs.length - 1];
      const unread = msgs.filter(
        (m) => m.sender_id !== profile.id && !m.read_at,
      ).length;

      return {
        id: row.id,
        adopterId: row.adopter_id,
        shelterProfileId: row.shelter_profile_id,
        postId: row.post_id,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        peerName: peer?.display_name ?? "Member",
        lastMessagePreview: last?.body?.slice(0, 120) ?? null,
        unreadCount: unread,
      };
    }),
  );

  return { ok: true, data: items };
}

export async function getConversationMessages(
  conversationId: string,
): Promise<
  ActionResult<{ messages: ChatMessage[]; peerName: string; postId: string | null }>
> {
  const profile = await getCurrentProfile();
  if (!profile) return { ok: false, error: "Sign in required" };

  if (useMock) {
    const c = getMockConversation(conversationId, profile.id);
    if (!c) return { ok: false, error: "Conversation not found" };
    return {
      ok: true,
      data: {
        messages: c.messages,
        peerName: c.peerName,
        postId: c.postId,
      },
    };
  }

  const supabase = await createClient();
  if (!supabase) return { ok: false, error: "Supabase is not configured" };

  const { data: conv, error: convError } = await supabase
    .from("conversations")
    .select("id, adopter_id, shelter_profile_id, post_id")
    .eq("id", conversationId)
    .maybeSingle();

  if (convError || !conv) {
    return { ok: false, error: "Conversation not found" };
  }
  if (
    conv.adopter_id !== profile.id &&
    conv.shelter_profile_id !== profile.id &&
    profile.role !== "admin"
  ) {
    return { ok: false, error: "Access denied" };
  }

  const peerId =
    conv.adopter_id === profile.id
      ? conv.shelter_profile_id
      : conv.adopter_id;

  const { data: peer } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("id", peerId)
    .maybeSingle();

  const { data: msgs, error: msgError } = await supabase
    .from("messages")
    .select("id, conversation_id, sender_id, body, created_at, read_at")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });

  if (msgError) {
    return { ok: false, error: "Could not load messages" };
  }

  // Mark peer messages as read
  await supabase
    .from("messages")
    .update({ read_at: new Date().toISOString() })
    .eq("conversation_id", conversationId)
    .neq("sender_id", profile.id)
    .is("read_at", null);

  return {
    ok: true,
    data: {
      peerName: peer?.display_name ?? "Member",
      postId: conv.post_id,
      messages: (msgs ?? []).map((m) => ({
        id: m.id,
        conversationId: m.conversation_id,
        senderId: m.sender_id,
        body: m.body,
        createdAt: m.created_at,
        readAt: m.read_at,
      })),
    },
  };
}

export async function startConversation(
  raw: unknown,
): Promise<ActionResult<{ id: string }>> {
  const profile = await getCurrentProfile();
  if (!profile) return { ok: false, error: "Sign in required" };
  if (profile.role === "shelter") {
    return {
      ok: false,
      error: "Shelters reply in existing threads; adopters start the chat",
    };
  }

  const parsed = startConversationSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid" };
  }

  const { shelterProfileId, postId, initialMessage } = parsed.data;

  if (shelterProfileId === profile.id) {
    return { ok: false, error: "Cannot message yourself" };
  }

  if (useMock) {
    const existing = findMockConversation(profile.id, shelterProfileId);
    if (existing) {
      if (initialMessage) {
        const msg: ChatMessage = {
          id: `m-${randomUUID().slice(0, 8)}`,
          conversationId: existing.id,
          senderId: profile.id,
          body: initialMessage,
          createdAt: new Date().toISOString(),
          readAt: null,
        };
        appendMockMessage(existing.id, msg, initialMessage.slice(0, 120));
      }
      return { ok: true, data: { id: existing.id } };
    }

    const id = `c-${randomUUID().slice(0, 8)}`;
    const now = new Date().toISOString();
    const messages: ChatMessage[] = [];
    if (initialMessage) {
      messages.push({
        id: `m-${randomUUID().slice(0, 8)}`,
        conversationId: id,
        senderId: profile.id,
        body: initialMessage,
        createdAt: now,
        readAt: null,
      });
    }
    upsertMockConversation({
      id,
      adopterId: profile.id,
      shelterProfileId,
      postId: postId ?? null,
      createdAt: now,
      updatedAt: now,
      peerName: "Rescue",
      lastMessagePreview: initialMessage?.slice(0, 120) ?? null,
      unreadCount: 0,
      messages,
    });
    revalidatePath("/messages");
    return { ok: true, data: { id } };
  }

  const supabase = await createClient();
  if (!supabase) return { ok: false, error: "Supabase is not configured" };

  // Reuse existing thread if any
  const { data: existing } = await supabase
    .from("conversations")
    .select("id")
    .eq("adopter_id", profile.id)
    .eq("shelter_profile_id", shelterProfileId)
    .maybeSingle();

  let conversationId = existing?.id as string | undefined;

  if (!conversationId) {
    const { data: created, error } = await supabase
      .from("conversations")
      .insert({
        adopter_id: profile.id,
        shelter_profile_id: shelterProfileId,
        post_id: postId ?? null,
      })
      .select("id")
      .single();

    if (error || !created) {
      console.error("[startConversation]", error?.message);
      return { ok: false, error: "Could not start conversation" };
    }
    conversationId = created.id;
  }

  if (initialMessage) {
    await supabase.from("messages").insert({
      conversation_id: conversationId,
      sender_id: profile.id,
      body: initialMessage,
    });
  }

  revalidatePath("/messages");
  revalidatePath(`/messages/${conversationId}`);
  return { ok: true, data: { id: conversationId } };
}

export async function sendMessage(
  raw: unknown,
): Promise<ActionResult<{ id: string }>> {
  const profile = await getCurrentProfile();
  if (!profile) return { ok: false, error: "Sign in required" };

  const parsed = sendMessageSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid" };
  }

  const { conversationId, body } = parsed.data;

  if (useMock) {
    const c = getMockConversation(conversationId, profile.id);
    if (!c) return { ok: false, error: "Conversation not found" };
    const msg: ChatMessage = {
      id: `m-${randomUUID().slice(0, 8)}`,
      conversationId,
      senderId: profile.id,
      body,
      createdAt: new Date().toISOString(),
      readAt: null,
    };
    appendMockMessage(conversationId, msg, body.slice(0, 120));
    revalidatePath(`/messages/${conversationId}`);
    revalidatePath("/messages");
    return { ok: true, data: { id: msg.id } };
  }

  const supabase = await createClient();
  if (!supabase) return { ok: false, error: "Supabase is not configured" };

  const { data, error } = await supabase
    .from("messages")
    .insert({
      conversation_id: conversationId,
      sender_id: profile.id,
      body,
    })
    .select("id")
    .single();

  if (error || !data) {
    console.error("[sendMessage]", error?.message);
    return { ok: false, error: "Could not send message" };
  }

  revalidatePath(`/messages/${conversationId}`);
  revalidatePath("/messages");
  return { ok: true, data: { id: data.id } };
}
