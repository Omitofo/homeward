"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui";
import { AuthSheet } from "@/features/auth/components/AuthSheet";
import type { AuthIntent } from "@/features/auth/intent";
import { StartChatButton } from "@/features/chat";
import { LikeButton, SaveButton, ShareButton } from "@/features/engagement";
import { ReportButton } from "@/features/moderation";
import type { PostStatus, Role } from "@/types/domain";

type Props = {
  postId: string;
  status: PostStatus;
  signedIn: boolean;
  likeCount: number;
  initialLiked?: boolean;
  initialSaved?: boolean;
  userId?: string | null;
  role?: Role | null;
  /** public.shelters.id */
  shelterId?: string | null;
  shareTitle: string;
  shareUrl: string;
  shareText?: string;
};

export function PostActions({
  postId,
  status,
  signedIn,
  likeCount,
  initialLiked = false,
  initialSaved = false,
  userId,
  role,
  shelterId,
  shareTitle,
  shareUrl,
  shareText,
}: Props) {
  const pathname = usePathname();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [intent, setIntent] = useState<AuthIntent | null>(null);

  const canLike = role !== "shelter";
  const canSave = role !== "shelter";
  const canStartChat = role !== "shelter";

  return (
    <>
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-start gap-3">
          {shelterId && canStartChat ? (
            <StartChatButton
              shelterId={shelterId}
              postId={postId}
              signedIn={signedIn}
              disabled={status !== "available"}
              label={
                status === "available"
                  ? "Contact shelter"
                  : status === "reserved"
                    ? "Currently reserved"
                    : "Already adopted"
              }
            />
          ) : (
            <Button size="lg" disabled>
              {status === "available"
                ? role === "shelter"
                  ? "Shelters reply in Messages"
                  : "Contact shelter"
                : status === "reserved"
                  ? "Currently reserved"
                  : "Already adopted"}
            </Button>
          )}

          <LikeButton
            postId={postId}
            initialCount={likeCount}
            initialLiked={initialLiked}
            signedIn={signedIn}
            userId={userId}
            canLike={canLike}
            size="lg"
          />

          <SaveButton
            postId={postId}
            initialSaved={initialSaved}
            signedIn={signedIn}
            userId={userId}
            canSave={canSave}
            size="lg"
          />

          <ShareButton
            url={shareUrl}
            title={shareTitle}
            text={shareText}
            size="lg"
          />
        </div>

        <ReportButton
          targetType="post"
          targetId={postId}
          signedIn={signedIn}
          returnTo={pathname || `/post/${postId}`}
        />
      </div>

      <AuthSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        intent={intent}
        next={pathname || `/post/${postId}`}
      />
    </>
  );
}
