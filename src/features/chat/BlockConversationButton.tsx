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
        Support cannot be blocked
      </p>
    );
  }

  const onBlock = async () => {
    const confirmed = window.confirm(
      "Block this person? Neither of you can message until you unblock. History is kept.",
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
        Messaging unavailable
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
        title={blockedByMe ? "Unblock" : "Block user"}
        aria-label={blockedByMe ? "Unblock user" : "Block user"}
        className={
          blockedByMe
            ? "min-w-9 px-2"
            : "min-w-9 px-2 text-danger hover:text-danger"
        }
      >
        {busy ? (
          "…"
        ) : blockedByMe ? (
          <span aria-hidden className="text-base leading-none">
            ⊘
          </span>
        ) : (
          <span aria-hidden className="text-base leading-none">
            🚫
          </span>
        )}
      </Button>
      {error ? (
        <p className="text-xs text-danger" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
