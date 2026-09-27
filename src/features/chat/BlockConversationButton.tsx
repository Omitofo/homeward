"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui";
import { blockPeer, unblockPeer } from "./actions";

type Props = {
  conversationId: string;
  blockedByMe: boolean;
  messagingBlocked: boolean;
  peerIsAdmin?: boolean;
};

export function BlockConversationButton({
  conversationId,
  blockedByMe,
  messagingBlocked,
  peerIsAdmin = false,
}: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (peerIsAdmin) {
    return (
      <p className="max-w-[11rem] text-right text-xs text-muted">
        Support chats cannot be blocked.
      </p>
    );
  }

  const onBlock = async () => {
    const confirmed = window.confirm(
      "Block this person? They will not be able to message you (and you will not be able to message them) until you unblock. Chat history is kept for both of you.",
    );
    if (!confirmed) return;

    setBusy(true);
    setError(null);
    try {
      const result = await blockPeer({ conversationId });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.refresh();
    } catch {
      setError("Could not block");
    } finally {
      setBusy(false);
    }
  };

  const onUnblock = async () => {
    setBusy(true);
    setError(null);
    try {
      const result = await unblockPeer({ conversationId });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.refresh();
    } catch {
      setError("Could not unblock");
    } finally {
      setBusy(false);
    }
  };

  if (messagingBlocked && !blockedByMe) {
    return (
      <p className="max-w-[11rem] text-right text-xs text-muted">
        Messaging is unavailable with this person.
      </p>
    );
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Button
        type="button"
        variant={blockedByMe ? "secondary" : "ghost"}
        size="sm"
        disabled={busy}
        onClick={() => void (blockedByMe ? onUnblock() : onBlock())}
        className={blockedByMe ? undefined : "text-danger hover:text-danger"}
      >
        {busy ? "…" : blockedByMe ? "Unblock" : "Block"}
      </Button>
      {error ? (
        <p className="text-xs text-danger" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
