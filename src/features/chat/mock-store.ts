import type { ChatMessage, ConversationStatus, ConversationSummary } from "./schema";

type MockConversation = ConversationSummary & {
  messages: ChatMessage[];
  closedBy?: string | null;
};

const store = new Map<string, MockConversation>();

export function listMockConversationsForUser(
  userId: string,
): ConversationSummary[] {
  return [...store.values()]
    .filter(
      (c) => c.adopterId === userId || c.shelterProfileId === userId,
    )
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .map(({ messages: _m, closedBy: _c, ...summary }) => summary);
}

export function totalMockUnreadForUser(userId: string): number {
  let n = 0;
  for (const c of store.values()) {
    if (c.adopterId !== userId && c.shelterProfileId !== userId) continue;
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
  reason: string,
): boolean {
  const c = store.get(conversationId);
  if (!c) return false;
  if (c.adopterId !== userId && c.shelterProfileId !== userId) return false;
  c.status = "closed";
  c.closedBy = userId;
  c.updatedAt = new Date().toISOString();
  return true;
}

export function reopenMockConversation(
  conversationId: string,
  userId: string,
): boolean {
  const c = store.get(conversationId);
  if (!c) return false;
  if (c.adopterId !== userId && c.shelterProfileId !== userId) return false;
  c.status = "open";
  c.closedBy = null;
  c.updatedAt = new Date().toISOString();
  return true;
}
