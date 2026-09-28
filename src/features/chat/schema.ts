import { z } from "zod";

export const sendMessageSchema = z.object({
  conversationId: z.string().min(1),
  body: z
    .string()
    .trim()
    .min(1, "Message cannot be empty")
    .max(2000, "Message is too long"),
});

export const startConversationSchema = z.object({
  /** public.shelters.id */
  shelterId: z.string().min(1),
  postId: z.string().optional(),
  initialMessage: z
    .string()
    .trim()
    .min(1)
    .max(2000)
    .optional(),
});

export const blockPeerSchema = z.object({
  conversationId: z.string().min(1),
});

export const unblockPeerIdSchema = z.object({
  peerId: z.string().uuid(),
});

export type MessagesTab = "inbox" | "archived" | "blocked";

export type ChatMessage = {
  id: string;
  conversationId: string;
  senderId: string;
  body: string;
  createdAt: string;
  readAt: string | null;
};

export type ChatPostCard = {
  id: string;
  name: string;
  breed: string;
  status: string;
  imageUrl: string | null;
  imageAlt: string;
};

/** @deprecated mutual close removed */
export type ConversationStatus = "open" | "closed";

export type ConversationSummary = {
  id: string;
  adopterId: string;
  shelterProfileId: string;
  postId: string | null;
  status: ConversationStatus;
  createdAt: string;
  updatedAt: string;
  peerName: string;
  lastMessagePreview: string | null;
  unreadCount: number;
  blockedByMe?: boolean;
  archived?: boolean;
};

/** Row for the Blocked tab — always unblocks without needing the thread in inbox */
export type BlockedPeerSummary = {
  peerId: string;
  peerName: string;
  blockedAt: string;
  conversationId: string | null;
};

export const POST_MARKER_RE = /⟦post:([0-9a-fA-F-]{8,})⟧/g;
export const POST_PATH_RE = /\(\/post\/([0-9a-fA-F-]{8,})\)/g;
export const POST_PATH_BARE_RE = /\/post\/([0-9a-fA-F-]{8,})/g;

export function extractPostIdsFromBody(body: string): string[] {
  const ids = new Set<string>();
  for (const re of [POST_MARKER_RE, POST_PATH_RE, POST_PATH_BARE_RE]) {
    re.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = re.exec(body)) !== null) {
      if (m[1]) ids.add(m[1]);
    }
  }
  return [...ids];
}

export function displayMessageBody(body: string): string {
  return body
    .replace(POST_MARKER_RE, "")
    .replace(POST_PATH_RE, "")
    .replace(/\s{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
