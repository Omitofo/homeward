"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { ChatMessage } from "./schema";
import { MessageComposer } from "./MessageComposer";

type Props = {
  conversationId: string;
  initialMessages: ChatMessage[];
  currentUserId: string;
  /** Display name of the other participant (for screen-reader labels) */
  peerName?: string;
};

export function ChatThread({
  conversationId,
  initialMessages,
  currentUserId,
  peerName = "them",
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
          return (
            <li
              key={m.id}
              className={
                mine
                  ? "ml-8 self-end rounded-lg bg-primary px-3 py-2 text-sm text-primary-foreground"
                  : "mr-8 self-start rounded-lg border border-border bg-card px-3 py-2 text-sm"
              }
            >
              <span className="sr-only">{who} said: </span>
              <p className="whitespace-pre-wrap">{m.body}</p>
              <time
                className={
                  mine
                    ? "mt-1 block text-[10px] opacity-80"
                    : "mt-1 block text-[10px] text-muted"
                }
                dateTime={m.createdAt}
              >
                {new Date(m.createdAt).toLocaleString()}
              </time>
            </li>
          );
        })}
        <div ref={bottomRef} />
      </ul>

      <MessageComposer conversationId={conversationId} onSent={onSent} />
    </div>
  );
}
