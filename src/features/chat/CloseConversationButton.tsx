"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui";
import { closeConversation, reopenConversation } from "./actions";
import type { ConversationStatus } from "./schema";

type Props = {
  conversationId: string;
  status: ConversationStatus;
  /** True when the current user is allowed to reopen (they closed it, or admin). */
  canReopen?: boolean;
};

export function CloseConversationButton({
  conversationId,
  status,
  canReopen = false,
}: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isClosed = status === "closed";

  const onToggle = async () => {
    if (isClosed) {
      if (!canReopen) return;
      setBusy(true);
      setError(null);
      try {
        const result = await reopenConversation(conversationId);
        if (!result.ok) {
          setError(result.error);
          return;
        }
        router.refresh();
      } catch {
        setError("Could not reopen");
      } finally {
        setBusy(false);
      }
      return;
    }

    const confirmed = window.confirm(
      "Close this conversation? Neither of you will be able to send new messages. Only you will be able to reopen it.",
    );
    if (!confirmed) return;

    setBusy(true);
    setError(null);
    try {
      const result = await closeConversation({
        conversationId,
        reason: "Closed by participant",
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.refresh();
    } catch {
      setError("Could not close");
    } finally {
      setBusy(false);
    }
  };

  if (isClosed && !canReopen) {
    return (
      <p className="max-w-[11rem] text-right text-xs text-muted">
        Closed by the other person. Only they can reopen this chat.
      </p>
    );
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Button
        type="button"
        variant={isClosed ? "secondary" : "ghost"}
        size="sm"
        disabled={busy}
        onClick={() => void onToggle()}
      >
        {busy ? "…" : isClosed ? "Reopen chat" : "Close chat"}
      </Button>
      {error ? (
        <p className="text-xs text-danger" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
