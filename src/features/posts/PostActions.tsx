"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui";
import { MessageCircle } from "@/components/icons";
import { AuthSheet } from "@/features/auth/components/AuthSheet";
import type { AuthIntent } from "@/features/auth/intent";
import { StartChatButton, UnblockPeerButton } from "@/features/chat";
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
  shelterId?: string | null;
  shelterProfileId?: string | null;
  blockedByMe?: boolean;
  animalName?: string;
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
  shelterProfileId,
  blockedByMe = false,
  animalName,
  shareTitle,
  shareUrl,
  shareText,
}: Props) {
  const pathname = usePathname();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [intent, setIntent] = useState<AuthIntent | null>(null);

  const isOwnShelterPost =
    Boolean(userId) && Boolean(shelterProfileId) && userId === shelterProfileId;

  const canStartChat = !isOwnShelterPost && !blockedByMe;
  const contactLabel =
    role === "shelter"
      ? status === "available"
        ? "Message rescue"
        : status === "reserved"
          ? "Currently reserved"
          : "Already adopted"
      : status === "available"
        ? "Contact shelter"
        : status === "reserved"
          ? "Currently reserved"
          : "Already adopted";

  return (
    <>
      <div className="flex flex-col gap-4">
        {/* Icons grouped together: like · share · save */}
        <div className="flex items-center gap-1">
          <LikeButton
            postId={postId}
            initialCount={likeCount}
            initialLiked={initialLiked}
            signedIn={signedIn}
            userId={userId}
            canLike
            iconOnly
          />
          <ShareButton
            url={shareUrl}
            title={shareTitle}
            text={shareText}
            iconOnly
          />
          <SaveButton
            postId={postId}
            initialSaved={initialSaved}
            signedIn={signedIn}
            userId={userId}
            canSave
            iconOnly
          />
        </div>

        {likeCount > 0 ? (
          <p className="text-sm font-semibold tabular-nums text-foreground">
            {likeCount.toLocaleString("en-GB")}{" "}
            {likeCount === 1 ? "like" : "likes"}
          </p>
        ) : null}

        <div className="flex flex-wrap items-center gap-3">
          {blockedByMe && shelterProfileId ? (
            <UnblockPeerButton peerId={shelterProfileId} size="lg" showLabel />
          ) : shelterId && canStartChat ? (
            <StartChatButton
              shelterId={shelterId}
              postId={postId}
              animalName={animalName}
              signedIn={signedIn}
              disabled={status !== "available"}
              label={contactLabel}
            />
          ) : (
            <Button size="lg" disabled className="gap-2">
              <MessageCircle size={20} />
              {isOwnShelterPost
                ? "Your listing"
                : status === "available"
                  ? "Contact shelter"
                  : status === "reserved"
                    ? "Currently reserved"
                    : "Already adopted"}
            </Button>
          )}
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
