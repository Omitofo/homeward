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

export type ChatMessage = {
  id: string;
  conversationId: string;
  senderId: string;
  body: string;
  createdAt: string;
  readAt: string | null;
};

export type ConversationSummary = {
  id: string;
  adopterId: string;
  shelterProfileId: string;
  postId: string | null;
  createdAt: string;
  updatedAt: string;
  peerName: string;
  lastMessagePreview: string | null;
  unreadCount: number;
};
