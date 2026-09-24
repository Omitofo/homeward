"use client";

import { useEffect, useState, useTransition } from "react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui";
import { AuthSheet } from "@/features/auth/components/AuthSheet";
import type { AuthIntent } from "@/features/auth/intent";
import { toggleSave } from "./actions";
import { hasLocalSave, writeLocalSave } from "./local-store";

type Props = {
  postId: string;
  /** Server-known save state (real mode). Mock mode hydrates from localStorage. */
  initialSaved?: boolean;
  signedIn: boolean;
  /** Profile id for mock localStorage key; omit when signed out */
  userId?: string | null;
  /** Shelter role cannot save */
  canSave?: boolean;
  size?: "sm" | "md" | "lg";
};

export function SaveButton({
  postId,
  initialSaved = false,
  signedIn,
  userId,
  canSave = true,
  size = "lg",
}: Props) {
  const pathname = usePathname();
  const [saved, setSaved] = useState(initialSaved);
  const [error, setError] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [intent, setIntent] = useState<AuthIntent | null>(null);
  const [pending, startTransition] = useTransition();

  // Hydrate mock-mode saves from localStorage after mount
  useEffect(() => {
    if (!signedIn || !userId) return;
    if (initialSaved) return;
    if (hasLocalSave(userId, postId)) {
      setSaved(true);
    }
  }, [signedIn, userId, postId, initialSaved]);

  function openAuth() {
    setIntent({
      type: "save",
      returnTo: pathname || `/post/${postId}`,
      postId,
    });
    setSheetOpen(true);
  }

  function onClick() {
    setError(null);

    if (!signedIn) {
      openAuth();
      return;
    }

    if (!canSave) {
      setError("Shelter accounts cannot save animals");
      return;
    }

    const prevSaved = saved;
    const nextSaved = !saved;

    setSaved(nextSaved);

    startTransition(async () => {
      const result = await toggleSave(postId, prevSaved);
      if (!result.ok) {
        setSaved(prevSaved);
        setError(result.error);
        return;
      }
      setSaved(result.data.saved);
      if (userId) {
        writeLocalSave(userId, postId, result.data.saved);
      }
    });
  }

  return (
    <div className="flex flex-col gap-1">
      <Button
        type="button"
        variant={saved ? "primary" : "ghost"}
        size={size}
        disabled={pending}
        onClick={onClick}
        aria-pressed={saved}
        aria-label={saved ? "Unsave" : "Save"}
      >
        <span aria-hidden className="inline-block">
          {saved ? "★" : "☆"}
        </span>
        <span>{saved ? "Saved" : "Save"}</span>
      </Button>
      {error && (
        <p className="text-sm text-danger" role="alert">
          {error}
        </p>
      )}
      <AuthSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        intent={intent}
        next={pathname || `/post/${postId}`}
      />
    </div>
  );
}
