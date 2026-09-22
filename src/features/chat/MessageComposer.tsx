"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui";
import { sendMessage } from "./actions";
import type { ChatMessage } from "./schema";

type Props = {
  conversationId: string;
  onSent?: (message: ChatMessage) => void;
};

export function MessageComposer({ conversationId, onSent }: Props) {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = body.trim();
    if (!trimmed) return;
    setBusy(true);
    setError(null);
    try {
      const result = await sendMessage({ conversationId, body: trimmed });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      // Optimistic local echo (realtime may also deliver)
      onSent?.({
        id: result.data.id,
        conversationId,
        senderId: result.data.senderId,
        body: trimmed,
        createdAt: result.data.createdAt,
        readAt: null,
      });
      setBody("");
      router.refresh();
    } catch {
      setError("Could not send");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-2 border-t border-border pt-4">
      <label htmlFor="msg-body" className="sr-only">
        Message
      </label>
      <textarea
        id="msg-body"
        rows={3}
        maxLength={2000}
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Write a message…"
        className="w-full rounded-md border border-input bg-card px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      />
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs text-muted">{body.length}/2000</span>
        <Button type="submit" size="sm" disabled={busy || !body.trim()}>
          {busy ? "Sending…" : "Send"}
        </Button>
      </div>
      {error ? (
        <p className="text-sm text-danger" role="alert">
          {error}
        </p>
      ) : null}
    </form>
  );
}
