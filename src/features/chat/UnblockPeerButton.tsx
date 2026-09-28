"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui";
import { unblockPeerById } from "./actions";

type Props = {
  peerId: string;
};

export function UnblockPeerButton({ peerId }: Props) {
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
        size="sm"
        disabled={busy}
        onClick={() => void onUnblock()}
      >
        {busy ? "…" : "Unblock"}
      </Button>
      {error ? (
        <p className="text-xs text-danger" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
