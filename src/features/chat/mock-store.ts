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
    .map(({ messages: _, ...summary }) => summary)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function getMockConversation(
  id: string,
  userId: string,
): Conv | null {
  const c = store.find((x) => x.id === id);
  if (!c) return null;
  if (c.adopterId !== userId && c.shelterProfileId !== userId) return null;
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
}
