"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { ChatMessage, ChatPostCard, ConversationStatus } from "./schema";
import {
  displayMessageBody,
  extractPostIdsFromBody,
} from "./schema";
import { MessageComposer } from "./MessageComposer";
import { AnimalChatCard } from "./AnimalChatCard";

type Props = {
  conversationId: string;
  initialMessages: ChatMessage[];
  currentUserId: string;
  /** Display name of the other participant (for screen-reader labels) */
  peerName?: string;
  /** Post cards keyed by post id (from message markers) */
  postCards?: Record<string, ChatPostCard>;
  status?: ConversationStatus;
};

/**
 * Locale-stable timestamp so SSR and client HTML match (avoids hydration mismatch).
 * Uses fixed en-GB options rather than the host default locale.
 */
function formatMessageTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(d);
}

export function ChatThread({
  conversationId,
  initialMessages,
  currentUserId,
  peerName = "them",
  postCards = {},
  status = "open",
}: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const bottomRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const closed = status === "closed";

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages.length, scrollToBottom]);

  // Supabase Realtime when configured; no-op in pure mock
  useEffect(() => {
    const supabase = createClient();
    if (!supabase) return;

    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const row = payload.new as {
            id: string;
            conversation_id: string;
            sender_id: string;
            body: string;
            created_at: string;
            read_at: string | null;
          };
          const next: ChatMessage = {
            id: row.id,
            conversationId: row.conversation_id,
            senderId: row.sender_id,
            body: row.body,
            createdAt: row.created_at,
            readAt: row.read_at,
          };
          setMessages((prev) => {
            if (prev.some((m) => m.id === next.id)) return prev;
            return [...prev, next];
          });
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [conversationId]);

  const onSent = useCallback((msg: ChatMessage) => {
    setMessages((prev) => {
      if (prev.some((m) => m.id === msg.id)) return prev;
      return [...prev, msg];
    });
  }, []);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <ul
        ref={listRef}
        className="flex flex-1 flex-col gap-3 overflow-y-auto pb-4"
        aria-live="polite"
        aria-relevant="additions"
        aria-label="Message thread"
      >
        {messages.length === 0 ? (
          <li className="text-sm text-muted">No messages yet. Say hello.</li>
        ) : null}
        {messages.map((m) => {
          const mine = m.senderId === currentUserId;
          const who = mine ? "You" : peerName;
          const text = displayMessageBody(m.body);
          const postIds = extractPostIdsFromBody(m.body);
          const cards = postIds
            .map((id) => postCards[id])
            .filter(Boolean) as ChatPostCard[];

          return (
            <li key={m.id} className="flex flex-col gap-1.5">
              {text ? (
                <div
                  className={
                    mine
                      ? "ml-8 self-end rounded-lg bg-primary px-3 py-2 text-sm text-primary-foreground"
                      : "mr-8 self-start rounded-lg border border-border bg-card px-3 py-2 text-sm"
                  }
                >
                  <span className="sr-only">{who} said: </span>
                  <p className="whitespace-pre-wrap">{text}</p>
                  <time
                    className={
                      mine
                        ? "mt-1 block text-[10px] opacity-80"
                        : "mt-1 block text-[10px] text-muted"
                    }
                    dateTime={m.createdAt}
                  >
                    {formatMessageTime(m.createdAt)}
                  </time>
                </div>
              ) : null}
              {cards.map((post) => (
                <AnimalChatCard
                  key={`${m.id}-${post.id}`}
                  post={post}
                  align={mine ? "end" : "start"}
                />
              ))}
            </li>
          );
        })}
        <div ref={bottomRef} />
      </ul>

      {closed ? (
        <div
          className="border-t border-border pt-4 text-center text-sm text-muted"
          role="status"
        >
          This conversation is closed. New messages are disabled.
        </div>
      ) : (
        <MessageComposer conversationId={conversationId} onSent={onSent} />
      )}
    </div>
  );
}
