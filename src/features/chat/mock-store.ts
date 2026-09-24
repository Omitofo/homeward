import type { ChatMessage, ConversationSummary } from "./schema";

type Conv = ConversationSummary & {
  messages: ChatMessage[];
};

const store: Conv[] = [];

export function listMockConversationsForUser(
  userId: string,
): ConversationSummary[] {
  return store
    .filter((c) => c.adopterId === userId || c.shelterProfileId === userId)
    .map((c) => {
      const { messages, ...summary } = c;
      const unreadCount = messages.filter(
        (m) => m.senderId !== userId && !m.readAt,
      ).length;
      return { ...summary, unreadCount };
    })
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function getMockConversation(
  id: string,
  userId: string,
): Conv | null {
  const c = store.find((x) => x.id === id);
  if (!c) return null;
  if (c.adopterId !== userId && c.shelterProfileId !== userId) return null;
  // Mark peer messages as read when opening the thread (mirror Supabase path)
  const now = new Date().toISOString();
  for (const m of c.messages) {
    if (m.senderId !== userId && !m.readAt) {
      m.readAt = now;
    }
  }
  c.unreadCount = 0;
  return c;
}

export function findMockConversation(
  adopterId: string,
  shelterProfileId: string,
): Conv | null {
  return (
    store.find(
      (c) =>
        c.adopterId === adopterId && c.shelterProfileId === shelterProfileId,
    ) ?? null
  );
}

export function upsertMockConversation(conv: Conv): void {
  const idx = store.findIndex((c) => c.id === conv.id);
  if (idx >= 0) store[idx] = conv;
  else store.unshift(conv);
}

export function appendMockMessage(
  conversationId: string,
  message: ChatMessage,
  preview: string,
): void {
  const c = store.find((x) => x.id === conversationId);
  if (!c) return;
  c.messages.push(message);
  c.lastMessagePreview = preview;
  c.updatedAt = message.createdAt;
  // Unread for the peer is derived in listMockConversationsForUser
}

export function totalMockUnreadForUser(userId: string): number {
  return listMockConversationsForUser(userId).reduce(
    (sum, c) => sum + c.unreadCount,
    0,
  );
}
