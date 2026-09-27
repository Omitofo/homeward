"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui";
import { archiveConversation } from "./actions";

type Props = {
  conversationId: string;
};

/**
 * Archive = hide from my inbox only. History stays on the server for both sides.
 * Peer messaging un-archives for me (WhatsApp-style).
 */
export function HideConversationButton({ conversationId }: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onArchive = async () => {
    const confirmed = window.confirm(
      "Archive this chat? It leaves your inbox but stays on the server. The other person keeps their full history. If they message you again, it will reappear.",
    );
    if (!confirmed) return;

    setBusy(true);
    setError(null);
    try {
      const result = await archiveConversation(conversationId);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.push("/messages");
      router.refresh();
    } catch {
      setError("Could not archive chat");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col items-end gap-1">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        disabled={busy}
        onClick={() => void onArchive()}
      >
        {busy ? "…" : "Archive"}
      </Button>
      {error ? (
        <p className="max-w-[14rem] text-right text-xs text-danger" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
