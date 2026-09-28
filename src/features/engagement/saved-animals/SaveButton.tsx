"use client";

import { useEffect, useState, useTransition } from "react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui";
import { Bookmark, BookmarkSolid } from "@/components/icons";
import { AuthSheet } from "@/features/auth/components/AuthSheet";
import type { AuthIntent } from "@/features/auth/intent";
import { toggleSave } from "./actions";
import { hasLocalSave, writeLocalSave } from "./local-store";

type Props = {
  postId: string;
  initialSaved?: boolean;
  signedIn: boolean;
  userId?: string | null;
  canSave?: boolean;
  size?: "sm" | "md" | "lg" | "icon";
  iconOnly?: boolean;
};

export function SaveButton({
  postId,
  initialSaved = false,
  signedIn,
  userId,
  canSave = true,
  size = "icon",
  iconOnly = true,
}: Props) {
  const pathname = usePathname();
  const [saved, setSaved] = useState(initialSaved);
  const [error, setError] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [intent, setIntent] = useState<AuthIntent | null>(null);
  const [pending, startTransition] = useTransition();

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
        variant="ghost"
        size={iconOnly ? "icon" : size}
        disabled={pending}
        onClick={onClick}
        aria-pressed={saved}
        aria-label={saved ? "Unsave" : "Save"}
        title={saved ? "Saved" : "Save"}
      >
        {saved ? <BookmarkSolid size={24} /> : <Bookmark size={24} />}
        {!iconOnly ? <span>{saved ? "Saved" : "Save"}</span> : null}
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
