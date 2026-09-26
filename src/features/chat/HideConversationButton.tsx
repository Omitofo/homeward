"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui";
import { hideConversationForMe } from "./actions";
import type { ConversationStatus } from "./schema";

type Props = {
  conversationId: string;
  status: ConversationStatus;
};

export function HideConversationButton({
  conversationId,
  status,
}: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const removeOnly = async () => {
    const confirmed = window.confirm(
      "Remove this chat from your inbox? The other person still has their copy. This does not delete messages for them.",
    );
    if (!confirmed) return;

    setBusy(true);
    setError(null);
    try {
      const result = await hideConversationForMe(conversationId, {
        alsoClose: false,
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.push("/messages");
      router.refresh();
    } catch {
      setError("Could not remove chat");
    } finally {
      setBusy(false);
    }
  };

  const closeAndRemove = async () => {
    const confirmed = window.confirm(
      "Close this chat and remove it from your inbox? Neither of you can send new messages until you reopen it. The other person still keeps their history.",
    );
    if (!confirmed) return;

    setBusy(true);
    setError(null);
    try {
      const result = await hideConversationForMe(conversationId, {
        alsoClose: true,
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.push("/messages");
      router.refresh();
    } catch {
      setError("Could not close and remove");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex flex-wrap justify-end gap-1">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={busy}
          onClick={() => void removeOnly()}
        >
          {busy ? "…" : "Remove from inbox"}
        </Button>
        {status === "open" ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={busy}
            onClick={() => void closeAndRemove()}
            className="text-danger hover:text-danger"
          >
            Close & remove
          </Button>
        ) : null}
      </div>
      {error ? (
        <p className="max-w-[14rem] text-right text-xs text-danger" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
