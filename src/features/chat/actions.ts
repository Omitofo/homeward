"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { getCurrentProfile } from "@/features/auth/session";
import type { ActionResult } from "@/features/auth/types";
import { createClient } from "@/lib/supabase/server";
import { rateLimit, RATE_LIMITS } from "@/lib/security";
import { mockShelters } from "@/data/mock/shelters";
import { postsRepository } from "@/features/posts";
import {
  sendMessageSchema,
  startConversationSchema,
  blockPeerSchema,
  extractPostIdsFromBody,
  type ChatMessage,
  type ChatPostCard,
  type ConversationSummary,
} from "./schema";
import {
  appendMockMessage,
  blockMockPeer,
  findMockConversation,
  getMockConversation,
  hideMockConversation,
  isMockBlocked,
  isMockBlockedByMe,
  listMockConversationsForUser,
  totalMockUnreadForUser,
  unblockMockPeer,
  unhideMockConversationForBoth,
  unhideMockConversationForPeer,
  upsertMockConversation,
} from "./mock-store";

const useMock = process.env.NEXT_PUBLIC_USE_MOCK_DATA !== "false";

async function resolveShelterProfileId(
  shelterId: string,
): Promise<{ profileId: string; orgName: string } | null> {
  if (useMock) {
    const s = mockShelters.find((x) => x.id === shelterId);
    if (!s) return null;
    return { profileId: `profile-${shelterId}`, orgName: s.orgName };
  }
  const supabase = await createClient();
  if (!supabase) return null;
  const { data } = await supabase
    .from("shelters")
    .select("profile_id, org_name")
    .eq("id", shelterId)
    .maybeSingle();
  if (!data) return null;
  return { profileId: data.profile_id, orgName: data.org_name };
}

async function resolvePostCards(
  messages: ChatMessage[],
): Promise<Record<string, ChatPostCard>> {
  const ids = new Set<string>();
  for (const m of messages) {
    for (const id of extractPostIdsFromBody(m.body)) ids.add(id);
  }
  if (ids.size === 0) return {};
  const cards: Record<string, ChatPostCard> = {};
  await Promise.all(
    [...ids].map(async (id) => {
      const post = await postsRepository.getById(id);
      if (!post) return;
      const media = post.media[0];
      cards[id] = {
        id: post.id,
        name: post.name,
        breed: post.breed,
        status: post.status,
        imageUrl: media?.url ?? null,
        imageAlt: media?.altText || post.name,
      };
    }),
  );
  return cards;
}

async function pairIsBlocked(
  supabase: NonNullable<Awaited<ReturnType<typeof createClient>>>,
  a: string,
  b: string,
): Promise<boolean> {
  const { data } = await supabase
    .from("profile_blocks")
    .select("blocker_id")
    .or(
      `and(blocker_id.eq.${a},blocked_id.eq.${b}),and(blocker_id.eq.${b},blocked_id.eq.${a})`,
    )
    .limit(1);
  return Boolean(data && data.length > 0);
}

async function iBlockedPeer(
  supabase: NonNullable<Awaited<ReturnType<typeof createClient>>>,
  me: string,
  peer: string,
): Promise<boolean> {
  const { data } = await supabase
    .from("profile_blocks")
    .select("blocker_id")
    .eq("blocker_id", me)
    .eq("blocked_id", peer)
    .maybeSingle();
  return Boolean(data);
}

/** Clear archive for both participants (WhatsApp: activity restores inbox). */
async function clearArchiveForConversation(
  supabase: NonNullable<Awaited<ReturnType<typeof createClient>>>,
  conversationId: string,
) {
  await supabase
    .from("conversation_hides")
    .delete()
    .eq("conversation_id", conversationId);
}

export async function getUnreadMessageCount(): Promise<number> {
  const profile = await getCurrentProfile();
  if (!profile) return 0;
  if (useMock) return totalMockUnreadForUser(profile.id);
  const supabase = await createClient();
  if (!supabase) return 0;
  const { data: convs, error: convError } = await supabase
    .from("conversations")
    .select("id")
    .or(`adopter_id.eq.${profile.id},shelter_profile_id.eq.${profile.id}`);
  if (convError || !convs?.length) return 0;
  const { data: hides } = await supabase
    .from("conversation_hides")
    .select("conversation_id")
    .eq("user_id", profile.id);
  const hiddenIds = new Set((hides ?? []).map((h) => h.conversation_id as string));
  const ids = convs.map((c) => c.id).filter((id) => !hiddenIds.has(id));
  if (ids.length === 0) return 0;
  const { count, error } = await supabase
    .from("messages")
    .select("id", { count: "exact", head: true })
    .in("conversation_id", ids)
    .neq("sender_id", profile.id)
    .is("read_at", null);
  if (error) {
    console.error("[getUnreadMessageCount]", error.message);
    return 0;
  }
  return count ?? 0;
}

export async function listConversations(): Promise<
  ActionResult<ConversationSummary[]>
> {
  const profile = await getCurrentProfile();
  if (!profile) return { ok: false, error: "Sign in required" };
  if (useMock) {
    return { ok: true, data: listMockConversationsForUser(profile.id) };
  }
  const supabase = await createClient();
  if (!supabase) return { ok: false, error: "Supabase is not configured" };
  const { data, error } = await supabase
    .from("conversations")
    .select(
      `id, adopter_id, shelter_profile_id, post_id, status, created_at, updated_at, messages ( body, created_at, sender_id, read_at )`,
    )
    .or(`adopter_id.eq.${profile.id},shelter_profile_id.eq.${profile.id}`)
    .order("updated_at", { ascending: false });
  if (error) {
    console.error("[listConversations]", error.message);
    return { ok: false, error: "Could not load conversations" };
  }
  const { data: hides } = await supabase
    .from("conversation_hides")
    .select("conversation_id")
    .eq("user_id", profile.id);
  const hiddenIds = new Set((hides ?? []).map((h) => h.conversation_id as string));
  const visible = (data ?? []).filter((row) => !hiddenIds.has(row.id));
  const items: ConversationSummary[] = await Promise.all(
    visible.map(async (row) => {
      const peerId =
        row.adopter_id === profile.id ? row.shelter_profile_id : row.adopter_id;
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
      const blockedByMe = await iBlockedPeer(supabase, profile.id, peerId);
      return {
        id: row.id,
        adopterId: row.adopter_id,
        shelterProfileId: row.shelter_profile_id,
        postId: row.post_id,
        status: "open",
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        peerName: peer?.display_name ?? "Member",
        lastMessagePreview: last?.body?.slice(0, 120) ?? null,
        unreadCount: unread,
        blockedByMe,
      };
    }),
  );
  return { ok: true, data: items };
}

export async function getConversationMessages(
  conversationId: string,
): Promise<
  ActionResult<{
    messages: ChatMessage[];
    peerName: string;
    postId: string | null;
    postCards: Record<string, ChatPostCard>;
    peerId: string;
    peerIsAdmin: boolean;
    blockedByMe: boolean;
    messagingBlocked: boolean;
  }>
> {
  const profile = await getCurrentProfile();
  if (!profile) return { ok: false, error: "Sign in required" };
  if (useMock) {
    const c = getMockConversation(conversationId, profile.id);
    if (!c) return { ok: false, error: "Conversation not found" };
    const peerId =
      c.adopterId === profile.id ? c.shelterProfileId : c.adopterId;
    const postCards = await resolvePostCards(c.messages);
    const blockedByMe = isMockBlockedByMe(profile.id, peerId);
    return {
      ok: true,
      data: {
        messages: c.messages,
        peerName: c.peerName,
        postId: c.postId,
        postCards,
        peerId,
        peerIsAdmin: false,
        blockedByMe,
        messagingBlocked: isMockBlocked(profile.id, peerId),
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
  if (convError || !conv) return { ok: false, error: "Conversation not found" };
  if (
    conv.adopter_id !== profile.id &&
    conv.shelter_profile_id !== profile.id &&
    profile.role !== "admin"
  ) {
    return { ok: false, error: "Access denied" };
  }
  const peerId =
    conv.adopter_id === profile.id ? conv.shelter_profile_id : conv.adopter_id;
  const { data: peer } = await supabase
    .from("profiles")
    .select("display_name, role")
    .eq("id", peerId)
    .maybeSingle();
  const { data: msgs, error: msgError } = await supabase
    .from("messages")
    .select("id, conversation_id, sender_id, body, created_at, read_at")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });
  if (msgError) return { ok: false, error: "Could not load messages" };
  await supabase
    .from("messages")
    .update({ read_at: new Date().toISOString() })
    .eq("conversation_id", conversationId)
    .neq("sender_id", profile.id)
    .is("read_at", null);
  const messages: ChatMessage[] = (msgs ?? []).map((m) => ({
    id: m.id,
    conversationId: m.conversation_id,
    senderId: m.sender_id,
    body: m.body,
    createdAt: m.created_at,
    readAt: m.read_at,
  }));
  const postCards = await resolvePostCards(messages);
  const blockedByMe = await iBlockedPeer(supabase, profile.id, peerId);
  const messagingBlocked = await pairIsBlocked(
    supabase,
    conv.adopter_id,
    conv.shelter_profile_id,
  );
  return {
    ok: true,
    data: {
      peerName: peer?.display_name ?? "Member",
      postId: conv.post_id,
      messages,
      postCards,
      peerId,
      peerIsAdmin: peer?.role === "admin",
      blockedByMe,
      messagingBlocked,
    },
  };
}

export async function startConversation(
  raw: unknown,
): Promise<ActionResult<{ id: string }>> {
  const profile = await getCurrentProfile();
  if (!profile) return { ok: false, error: "Sign in required" };
  if (profile.role === "shelter") {
    // ok
  } else if (profile.role !== "adopter" && profile.role !== "admin") {
    return { ok: false, error: "Cannot start a chat with this account" };
  }
  const limited = rateLimit(`start-chat:${profile.id}`, RATE_LIMITS.startChat);
  if (!limited.ok) {
    return {
      ok: false,
      error: `Too many new chats. Wait about ${limited.retryAfterSec}s and try again.`,
    };
  }
  const parsed = startConversationSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid" };
  }
  const { shelterId, postId, initialMessage } = parsed.data;
  const shelter = await resolveShelterProfileId(shelterId);
  if (!shelter) return { ok: false, error: "Shelter not found" };
  const shelterProfileId = shelter.profileId;
  if (shelterProfileId === profile.id) {
    return { ok: false, error: "Cannot message yourself" };
  }
  const body =
    initialMessage ??
    (profile.role === "shelter"
      ? "Hi! Reaching out from our rescue — happy to coordinate if useful."
      : undefined);
  if (useMock) {
    if (isMockBlocked(profile.id, shelterProfileId)) {
      return { ok: false, error: "You can't message this person (blocked)." };
    }
    const existing = findMockConversation(profile.id, shelterProfileId);
    if (existing) {
      if (body) {
        const msg: ChatMessage = {
          id: `m-${randomUUID().slice(0, 8)}`,
          conversationId: existing.id,
          senderId: profile.id,
          body,
          createdAt: new Date().toISOString(),
          readAt: null,
        };
        appendMockMessage(existing.id, msg, body.slice(0, 120));
      }
      unhideMockConversationForBoth(existing.id);
      return { ok: true, data: { id: existing.id } };
    }
    const id = `c-${randomUUID().slice(0, 8)}`;
    const now = new Date().toISOString();
    const messages: ChatMessage[] = [];
    if (body) {
      messages.push({
        id: `m-${randomUUID().slice(0, 8)}`,
        conversationId: id,
        senderId: profile.id,
        body,
        createdAt: now,
        readAt: null,
      });
    }
    upsertMockConversation({
      id,
      adopterId: profile.id,
      shelterProfileId,
      postId: postId ?? null,
      status: "open",
      createdAt: now,
      updatedAt: now,
      peerName: shelter.orgName,
      lastMessagePreview: body?.slice(0, 120) ?? null,
      unreadCount: 0,
      messages,
    });
    revalidatePath("/messages");
    return { ok: true, data: { id } };
  }
  const supabase = await createClient();
  if (!supabase) return { ok: false, error: "Supabase is not configured" };
  if (await pairIsBlocked(supabase, profile.id, shelterProfileId)) {
    return { ok: false, error: "You can't message this person (blocked)." };
  }
  const { data: existing } = await supabase
    .from("conversations")
    .select("id")
    .eq("adopter_id", profile.id)
    .eq("shelter_profile_id", shelterProfileId)
    .maybeSingle();
  let conversationId: string;
  if (existing?.id) {
    conversationId = existing.id;
  } else {
    const { data: created, error } = await supabase
      .from("conversations")
      .insert({
        adopter_id: profile.id,
        shelter_profile_id: shelterProfileId,
        post_id: postId ?? null,
        status: "open",
      })
      .select("id")
      .single();
    if (error || !created?.id) {
      console.error("[startConversation]", error?.message);
      return { ok: false, error: "Could not start conversation" };
    }
    conversationId = created.id;
  }
  if (body) {
    const { error: msgError } = await supabase.from("messages").insert({
      conversation_id: conversationId,
      sender_id: profile.id,
      body,
    });
    if (msgError) console.error("[startConversation] message", msgError.message);
  }
  // Resume / message restores inbox for both (not only peer)
  await clearArchiveForConversation(supabase, conversationId);
  revalidatePath("/messages");
  revalidatePath(`/messages/${conversationId}`);
  return { ok: true, data: { id: conversationId } };
}

export async function sendMessage(
  raw: unknown,
): Promise<
  ActionResult<{ id: string; senderId: string; createdAt: string }>
> {
  const profile = await getCurrentProfile();
  if (!profile) return { ok: false, error: "Sign in required" };
  const limited = rateLimit(`message:${profile.id}`, RATE_LIMITS.message);
  if (!limited.ok) {
    return {
      ok: false,
      error: `Message limit reached (50 per 30 minutes). Wait about ${limited.retryAfterSec}s and try again.`,
    };
  }
  const parsed = sendMessageSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid" };
  }
  const { conversationId, body } = parsed.data;
  const now = new Date().toISOString();
  if (useMock) {
    const c = getMockConversation(conversationId, profile.id);
    if (!c) return { ok: false, error: "Conversation not found" };
    const peerId =
      c.adopterId === profile.id ? c.shelterProfileId : c.adopterId;
    if (isMockBlocked(profile.id, peerId)) {
      return { ok: false, error: "You can't message this person (blocked)." };
    }
    const msg: ChatMessage = {
      id: `m-${randomUUID().slice(0, 8)}`,
      conversationId,
      senderId: profile.id,
      body,
      createdAt: now,
      readAt: null,
    };
    appendMockMessage(conversationId, msg, body.slice(0, 120));
    unhideMockConversationForBoth(conversationId);
    revalidatePath(`/messages/${conversationId}`);
    revalidatePath("/messages");
    return { ok: true, data: { id: msg.id, senderId: profile.id, createdAt: now } };
  }
  const supabase = await createClient();
  if (!supabase) return { ok: false, error: "Supabase is not configured" };
  const { data: conv } = await supabase
    .from("conversations")
    .select("id, adopter_id, shelter_profile_id")
    .eq("id", conversationId)
    .maybeSingle();
  if (!conv) return { ok: false, error: "Conversation not found" };
  if (
    conv.adopter_id !== profile.id &&
    conv.shelter_profile_id !== profile.id &&
    profile.role !== "admin"
  ) {
    return { ok: false, error: "Access denied" };
  }
  if (await pairIsBlocked(supabase, conv.adopter_id, conv.shelter_profile_id)) {
    return { ok: false, error: "You can't message this person (blocked)." };
  }
  const { data, error } = await supabase
    .from("messages")
    .insert({ conversation_id: conversationId, sender_id: profile.id, body })
    .select("id, created_at")
    .single();
  if (error || !data) {
    console.error("[sendMessage]", error?.message);
    return { ok: false, error: "Could not send message" };
  }
  // Unarchive for both sides so inbox lists stay in sync after activity
  await clearArchiveForConversation(supabase, conversationId);
  revalidatePath(`/messages/${conversationId}`);
  revalidatePath("/messages");
  return {
    ok: true,
    data: { id: data.id, senderId: profile.id, createdAt: data.created_at },
  };
}

export async function archiveConversation(
  conversationId: string,
): Promise<ActionResult<{ id: string }>> {
  const profile = await getCurrentProfile();
  if (!profile) return { ok: false, error: "Sign in required" };
  if (useMock) {
    const ok = hideMockConversation(conversationId, profile.id);
    if (!ok) return { ok: false, error: "Conversation not found" };
    revalidatePath("/messages");
    revalidatePath(`/messages/${conversationId}`);
    return { ok: true, data: { id: conversationId } };
  }
  const supabase = await createClient();
  if (!supabase) return { ok: false, error: "Supabase is not configured" };
  const { data: conv } = await supabase
    .from("conversations")
    .select("id, adopter_id, shelter_profile_id")
    .eq("id", conversationId)
    .maybeSingle();
  if (!conv) return { ok: false, error: "Conversation not found" };
  if (
    conv.adopter_id !== profile.id &&
    conv.shelter_profile_id !== profile.id &&
    profile.role !== "admin"
  ) {
    return { ok: false, error: "Access denied" };
  }
  const { error } = await supabase.from("conversation_hides").upsert(
    {
      user_id: profile.id,
      conversation_id: conversationId,
      hidden_at: new Date().toISOString(),
    },
    { onConflict: "user_id,conversation_id" },
  );
  if (error) {
    console.error("[archiveConversation]", error.message);
    return {
      ok: false,
      error:
        "Could not archive. Run migration 20260927120000 if needed.",
    };
  }
  revalidatePath("/messages");
  revalidatePath(`/messages/${conversationId}`);
  return { ok: true, data: { id: conversationId } };
}

/** @deprecated use archiveConversation */
export async function hideConversationForMe(
  conversationId: string,
  _options?: { alsoClose?: boolean },
): Promise<ActionResult<{ id: string }>> {
  return archiveConversation(conversationId);
}

export async function blockPeer(
  raw: unknown,
): Promise<ActionResult<{ id: string }>> {
  const profile = await getCurrentProfile();
  if (!profile) return { ok: false, error: "Sign in required" };
  const parsed = blockPeerSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid" };
  }
  const { conversationId } = parsed.data;
  if (useMock) {
    const c = getMockConversation(conversationId, profile.id);
    if (!c) return { ok: false, error: "Conversation not found" };
    const peerId =
      c.adopterId === profile.id ? c.shelterProfileId : c.adopterId;
    blockMockPeer(profile.id, peerId);
    hideMockConversation(conversationId, profile.id);
    revalidatePath(`/messages/${conversationId}`);
    revalidatePath("/messages");
    return { ok: true, data: { id: conversationId } };
  }
  const supabase = await createClient();
  if (!supabase) return { ok: false, error: "Supabase is not configured" };
  const { data: conv } = await supabase
    .from("conversations")
    .select("id, adopter_id, shelter_profile_id")
    .eq("id", conversationId)
    .maybeSingle();
  if (!conv) return { ok: false, error: "Conversation not found" };
  if (
    conv.adopter_id !== profile.id &&
    conv.shelter_profile_id !== profile.id
  ) {
    return { ok: false, error: "Access denied" };
  }
  const peerId =
    conv.adopter_id === profile.id ? conv.shelter_profile_id : conv.adopter_id;
  const { data: peer } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", peerId)
    .maybeSingle();
  if (peer?.role === "admin") {
    return { ok: false, error: "You cannot block Homeward support." };
  }
  const { error } = await supabase.from("profile_blocks").upsert(
    { blocker_id: profile.id, blocked_id: peerId },
    { onConflict: "blocker_id,blocked_id" },
  );
  if (error) {
    console.error("[blockPeer]", error.message);
    return {
      ok: false,
      error:
        "Could not block. Run migration 20260928120000_grant_profile_blocks.sql if needed.",
    };
  }
  await supabase.from("conversation_hides").upsert(
    {
      user_id: profile.id,
      conversation_id: conversationId,
      hidden_at: new Date().toISOString(),
    },
    { onConflict: "user_id,conversation_id" },
  );
  revalidatePath(`/messages/${conversationId}`);
  revalidatePath("/messages");
  return { ok: true, data: { id: conversationId } };
}

export async function unblockPeer(
  raw: unknown,
): Promise<ActionResult<{ id: string }>> {
  const profile = await getCurrentProfile();
  if (!profile) return { ok: false, error: "Sign in required" };
  const parsed = blockPeerSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid" };
  }
  const { conversationId } = parsed.data;
  if (useMock) {
    const c = getMockConversation(conversationId, profile.id);
    if (!c) return { ok: false, error: "Conversation not found" };
    const peerId =
      c.adopterId === profile.id ? c.shelterProfileId : c.adopterId;
    unblockMockPeer(profile.id, peerId);
    revalidatePath(`/messages/${conversationId}`);
    revalidatePath("/messages");
    return { ok: true, data: { id: conversationId } };
  }
  const supabase = await createClient();
  if (!supabase) return { ok: false, error: "Supabase is not configured" };
  const { data: conv } = await supabase
    .from("conversations")
    .select("id, adopter_id, shelter_profile_id")
    .eq("id", conversationId)
    .maybeSingle();
  if (!conv) return { ok: false, error: "Conversation not found" };
  if (
    conv.adopter_id !== profile.id &&
    conv.shelter_profile_id !== profile.id
  ) {
    return { ok: false, error: "Access denied" };
  }
  const peerId =
    conv.adopter_id === profile.id ? conv.shelter_profile_id : conv.adopter_id;
  const { error } = await supabase
    .from("profile_blocks")
    .delete()
    .eq("blocker_id", profile.id)
    .eq("blocked_id", peerId);
  if (error) {
    console.error("[unblockPeer]", error.message);
    return { ok: false, error: "Could not unblock" };
  }
  revalidatePath(`/messages/${conversationId}`);
  revalidatePath("/messages");
  return { ok: true, data: { id: conversationId } };
}
