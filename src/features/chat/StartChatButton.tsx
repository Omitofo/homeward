"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui";
import { AuthSheet } from "@/features/auth/components/AuthSheet";
import type { AuthIntent } from "@/features/auth/intent";
import { startConversation } from "./actions";

type Props = {
  /** public.shelters.id */
  shelterId: string;
  postId?: string;
  /** Optional animal display name for a clearer intro message */
  animalName?: string;
  signedIn: boolean;
  disabled?: boolean;
  label?: string;
  size?: "sm" | "md" | "lg";
};

function buildInitialMessage(postId?: string, animalName?: string): string {
  if (postId) {
    const label = animalName?.trim() || "this animal";
    return `Hi! I'm interested in ${label} (/post/${postId}) and would love to learn more.`;
  }
  return "Hi! I'd like to learn more about adopting through your rescue.";
}

export function StartChatButton({
  shelterId,
  postId,
  animalName,
  signedIn,
  disabled,
  label = "Contact shelter",
  size = "lg",
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [intent, setIntent] = useState<AuthIntent | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onClick = async () => {
    if (!signedIn) {
      setIntent({
        type: "contact",
        returnTo: pathname || "/",
        postId,
      });
      setSheetOpen(true);
      return;
    }

    setBusy(true);
    setError(null);
    try {
      const result = await startConversation({
        shelterId,
        postId,
        initialMessage: buildInitialMessage(postId, animalName),
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.push(`/messages/${result.data.id}`);
    } catch {
      setError("Could not start chat");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col gap-1">
      <Button
        size={size}
        disabled={disabled || busy}
        onClick={() => void onClick()}
      >
        {busy ? "Opening…" : label}
      </Button>
      {error ? (
        <p className="text-xs text-danger" role="alert">
          {error}
        </p>
      ) : null}
      <AuthSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        intent={intent}
        next={pathname || "/"}
      />
    </div>
  );
}
