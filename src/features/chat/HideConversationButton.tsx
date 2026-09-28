"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui";
import { Archive } from "@/components/icons";
import { archiveConversation } from "./actions";

type Props = {
  conversationId: string;
};

export function HideConversationButton({ conversationId }: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onArchive = async () => {
    const confirmed = window.confirm(
      "Archive this chat? It leaves your inbox. New messages will bring it back.",
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
      setError("Could not archive");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col items-end gap-1">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        disabled={busy}
        onClick={() => void onArchive()}
        title="Archive chat"
        aria-label="Archive chat"
      >
        {busy ? (
          <span className="text-xs">…</span>
        ) : (
          <Archive size={20} />
        )}
      </Button>
      {error ? (
        <p className="max-w-[14rem] text-right text-xs text-danger" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
