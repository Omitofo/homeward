import type { ChatMessage, ConversationSummary } from "./schema";

type MockConversation = ConversationSummary & {
  messages: ChatMessage[];
  closedBy?: string | null;
  /** user ids who hid this conversation from their inbox */
  hiddenFor?: Set<string>;
};

const store = new Map<string, MockConversation>();

export function listMockConversationsForUser(
  userId: string,
): ConversationSummary[] {
  return [...store.values()]
    .filter(
      (c) =>
        (c.adopterId === userId || c.shelterProfileId === userId) &&
        !c.hiddenFor?.has(userId),
    )
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .map(({ messages: _m, closedBy: _c, hiddenFor: _h, ...summary }) => summary);
}

export function totalMockUnreadForUser(userId: string): number {
  let n = 0;
  for (const c of store.values()) {
    if (c.adopterId !== userId && c.shelterProfileId !== userId) continue;
    if (c.hiddenFor?.has(userId)) continue;
    n += c.messages.filter((m) => m.senderId !== userId && !m.readAt).length;
  }
  return n;
}

export function findMockConversation(
  initiatorId: string,
  peerShelterProfileId: string,
): MockConversation | undefined {
  return [...store.values()].find(
    (c) =>
      c.adopterId === initiatorId &&
      c.shelterProfileId === peerShelterProfileId,
  );
}

export function getMockConversation(
  id: string,
  userId: string,
): MockConversation | null {
  const c = store.get(id);
  if (!c) return null;
  if (c.adopterId !== userId && c.shelterProfileId !== userId) return null;
  return c;
}

export function upsertMockConversation(c: MockConversation) {
  store.set(c.id, c);
}

export function appendMockMessage(
  conversationId: string,
  msg: ChatMessage,
  preview: string,
) {
  const c = store.get(conversationId);
  if (!c) return;
  c.messages.push(msg);
  c.lastMessagePreview = preview;
  c.updatedAt = msg.createdAt;
}

export function closeMockConversation(
  conversationId: string,
  userId: string,
  _reason: string,
): boolean {
  const c = store.get(conversationId);
  if (!c) return false;
  if (c.adopterId !== userId && c.shelterProfileId !== userId) return false;
  c.status = "closed";
  c.closedBy = userId;
  c.updatedAt = new Date().toISOString();
  return true;
}

/** Only the user who closed the thread may reopen it. */
export function reopenMockConversation(
  conversationId: string,
  userId: string,
): { ok: true } | { ok: false; error: string } {
  const c = store.get(conversationId);
  if (!c) return { ok: false, error: "Conversation not found" };
  if (c.adopterId !== userId && c.shelterProfileId !== userId) {
    return { ok: false, error: "Access denied" };
  }
  if (c.status !== "closed") {
    return { ok: true };
  }
  if (c.closedBy && c.closedBy !== userId) {
    return {
      ok: false,
      error: "Only the person who closed this chat can reopen it.",
    };
  }
  c.status = "open";
  c.closedBy = null;
  c.updatedAt = new Date().toISOString();
  return { ok: true };
}

export function hideMockConversation(
  conversationId: string,
  userId: string,
): boolean {
  const c = store.get(conversationId);
  if (!c) return false;
  if (c.adopterId !== userId && c.shelterProfileId !== userId) return false;
  if (!c.hiddenFor) c.hiddenFor = new Set();
  c.hiddenFor.add(userId);
  return true;
}

/** Clear hide for the peer when sender posts a new message. */
export function unhideMockConversationForPeer(
  conversationId: string,
  senderId: string,
) {
  const c = store.get(conversationId);
  if (!c || !c.hiddenFor) return;
  const peer =
    c.adopterId === senderId ? c.shelterProfileId : c.adopterId;
  c.hiddenFor.delete(peer);
}
