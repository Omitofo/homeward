"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui";
import { Heart, HeartSolid } from "@/components/icons";
import { AuthSheet } from "@/features/auth/components/AuthSheet";
import type { AuthIntent } from "@/features/auth/intent";
import { useMotionPreference } from "@/motion/hooks/useMotionPreference";
import { toggleLike } from "./actions";
import { hasLocalLike, writeLocalLike } from "./local-store";
import { playLikeBurst } from "./like-burst";

type Props = {
  postId: string;
  initialCount: number;
  initialLiked?: boolean;
  signedIn: boolean;
  userId?: string | null;
  canLike?: boolean;
  size?: "sm" | "md" | "lg" | "icon";
  /** Instagram-style: icon only, count shown elsewhere */
  iconOnly?: boolean;
};

export function LikeButton({
  postId,
  initialCount,
  initialLiked = false,
  signedIn,
  userId,
  canLike = true,
  size = "icon",
  iconOnly = true,
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
        variant="ghost"
        size={iconOnly ? "icon" : size}
        disabled={pending}
        onClick={onClick}
        aria-pressed={liked}
        aria-label={liked ? "Unlike" : "Like"}
        title={liked ? "Unlike" : "Like"}
        className={liked ? "text-danger hover:text-danger" : undefined}
      >
        <span ref={iconRef} className="inline-flex">
          {liked ? <HeartSolid size={24} /> : <Heart size={24} />}
        </span>
        {!iconOnly ? (
          <>
            <span>{liked ? "Liked" : "Like"}</span>
            <span className="tabular-nums opacity-80">{count}</span>
          </>
        ) : null}
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
