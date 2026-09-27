import type { ChatMessage, ConversationSummary } from "./schema";

type MockConversation = ConversationSummary & {
  messages: ChatMessage[];
  /** user ids who archived this conversation from their inbox */
  hiddenFor?: Set<string>;
};

/** blockerId → set of blocked profile ids */
const blocks = new Map<string, Set<string>>();

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
    .map(({ messages: _m, hiddenFor: _h, ...summary }) => ({
      ...summary,
      status: "open" as const,
      blockedByMe: isMockBlocked(userId, peerIdOf(summary, userId)),
    }));
}

function peerIdOf(
  c: Pick<ConversationSummary, "adopterId" | "shelterProfileId">,
  userId: string,
): string {
  return c.adopterId === userId ? c.shelterProfileId : c.adopterId;
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

export function unhideMockConversation(
  conversationId: string,
  userId: string,
): boolean {
  const c = store.get(conversationId);
  if (!c) return false;
  c.hiddenFor?.delete(userId);
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

export function isMockBlocked(a: string, b: string): boolean {
  return Boolean(blocks.get(a)?.has(b) || blocks.get(b)?.has(a));
}

export function isMockBlockedByMe(me: string, peer: string): boolean {
  return Boolean(blocks.get(me)?.has(peer));
}

export function blockMockPeer(me: string, peer: string): boolean {
  if (me === peer) return false;
  let set = blocks.get(me);
  if (!set) {
    set = new Set();
    blocks.set(me, set);
  }
  set.add(peer);
  return true;
}

export function unblockMockPeer(me: string, peer: string): boolean {
  const set = blocks.get(me);
  if (!set) return true;
  set.delete(peer);
  return true;
}
