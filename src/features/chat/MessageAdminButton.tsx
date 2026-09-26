"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui";
import { startVerificationSupportChat } from "./support-actions";

type Props = {
  orgName: string;
  handle: string;
  verificationStatus: string;
};

export function MessageAdminButton({
  orgName,
  handle,
  verificationStatus,
}: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onClick = async () => {
    setBusy(true);
    setError(null);
    try {
      const result = await startVerificationSupportChat({
        orgName,
        handle,
        verificationStatus,
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.push(`/messages/${result.data.id}`);
    } catch {
      setError("Could not open chat");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col gap-1">
      <Button
        type="button"
        variant="secondary"
        size="sm"
        disabled={busy}
        onClick={() => void onClick()}
      >
        {busy ? "Opening…" : "Message admin about verification"}
      </Button>
      {error ? (
        <p className="text-xs text-danger" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
