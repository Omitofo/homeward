"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui";
import { AuthSheet } from "@/features/auth/components/AuthSheet";
import type { AuthIntent } from "@/features/auth/intent";
import { useMotionPreference } from "@/motion/hooks/useMotionPreference";
import { toggleLike } from "./actions";
import { hasLocalLike, writeLocalLike } from "./local-store";
import { playLikeBurst } from "./like-burst";

type Props = {
  postId: string;
  initialCount: number;
  /** Server-known like state (real mode). Mock mode hydrates from localStorage. */
  initialLiked?: boolean;
  signedIn: boolean;
  /** Profile id for mock localStorage key; omit when signed out */
  userId?: string | null;
  /** Shelter role cannot like */
  canLike?: boolean;
  size?: "sm" | "md" | "lg";
};

export function LikeButton({
  postId,
  initialCount,
  initialLiked = false,
  signedIn,
  userId,
  canLike = true,
  size = "lg",
}: Props) {
  const pathname = usePathname();
  const { enabled: motionEnabled } = useMotionPreference();
  const iconRef = useRef<HTMLSpanElement>(null);
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [error, setError] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [intent, setIntent] = useState<AuthIntent | null>(null);
  const [pending, startTransition] = useTransition();

  // Hydrate mock-mode likes from localStorage after mount
  useEffect(() => {
    if (!signedIn || !userId) return;
    if (initialLiked) return;
    if (hasLocalLike(userId, postId)) {
      setLiked(true);
    }
  }, [signedIn, userId, postId, initialLiked]);

  function openAuth() {
    setIntent({
      type: "like",
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

    if (!canLike) {
      setError("Shelter accounts cannot like posts");
      return;
    }

    const prevLiked = liked;
    const prevCount = count;
    const nextLiked = !liked;
    const nextCount = Math.max(0, count + (nextLiked ? 1 : -1));

    // Optimistic
    setLiked(nextLiked);
    setCount(nextCount);
    if (nextLiked && motionEnabled) {
      playLikeBurst(iconRef.current);
    }

    startTransition(async () => {
      const result = await toggleLike(postId, prevLiked, prevCount);
      if (!result.ok) {
        setLiked(prevLiked);
        setCount(prevCount);
        setError(result.error);
        return;
      }
      setLiked(result.data.liked);
      setCount(result.data.likeCount);
      if (userId) {
        writeLocalLike(userId, postId, result.data.liked);
      }
    });
  }

  return (
    <div className="flex flex-col gap-1">
      <Button
        type="button"
        variant={liked ? "primary" : "secondary"}
        size={size}
        disabled={pending}
        onClick={onClick}
        aria-pressed={liked}
        aria-label={liked ? "Unlike" : "Like"}
      >
        <span ref={iconRef} aria-hidden className="inline-block">
          {liked ? "♥" : "♡"}
        </span>
        <span>{liked ? "Liked" : "Like"}</span>
        <span className="tabular-nums opacity-80">{count}</span>
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
