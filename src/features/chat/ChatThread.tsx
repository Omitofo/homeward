"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { ChatMessage, ChatPostCard } from "./schema";
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
  peerName?: string;
  postCards?: Record<string, ChatPostCard>;
  messagingBlocked?: boolean;
  blockedByMe?: boolean;
};

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
  messagingBlocked = false,
  blockedByMe = false,
}: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const bottomRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages.length, scrollToBottom]);

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

      {messagingBlocked ? (
        <div
          className="border-t border-border pt-4 text-center text-sm text-muted"
          role="status"
        >
          {blockedByMe
            ? "You blocked this person. Unblock to send messages again. History is still here."
            : "You can't message this person right now."}
        </div>
      ) : (
        <MessageComposer conversationId={conversationId} onSent={onSent} />
      )}
    </div>
  );
}
