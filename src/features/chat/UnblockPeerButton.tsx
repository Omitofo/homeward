"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui";
import { Unlock } from "@/components/icons";
import { unblockPeerById } from "./actions";

type Props = {
  peerId: string;
  size?: "sm" | "md" | "lg" | "icon";
  showLabel?: boolean;
};

export function UnblockPeerButton({
  peerId,
  size = "sm",
  showLabel = false,
}: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onUnblock = async () => {
    setBusy(true);
    setError(null);
    try {
      const result = await unblockPeerById({ peerId });
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

  return (
    <div className="flex flex-col items-end gap-1">
      <Button
        type="button"
        variant="secondary"
        size={showLabel ? size : "icon"}
        disabled={busy}
        onClick={() => void onUnblock()}
        title="Unblock user"
        aria-label="Unblock user"
      >
        {busy ? (
          "…"
        ) : (
          <span className="inline-flex items-center gap-2">
            <Unlock size={20} />
            {showLabel ? <span>Unblock</span> : null}
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
