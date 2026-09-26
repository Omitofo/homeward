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
  /** Owning shelter profile id — hide contact on your own posts */
  shelterProfileId?: string | null;
  /** Animal display name for chat intro context */
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

  // Adopters + other shelters can start chat; not on your own listing
  const canStartChat = !isOwnShelterPost;
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
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-start gap-3">
          {shelterId && canStartChat ? (
            <StartChatButton
              shelterId={shelterId}
              postId={postId}
              animalName={animalName}
              signedIn={signedIn}
              disabled={status !== "available"}
              label={contactLabel}
            />
          ) : (
            <Button size="lg" disabled>
              {isOwnShelterPost
                ? "Your listing"
                : status === "available"
                  ? "Contact shelter"
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
            canLike
            size="lg"
          />

          <SaveButton
            postId={postId}
            initialSaved={initialSaved}
            signedIn={signedIn}
            userId={userId}
            canSave
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
