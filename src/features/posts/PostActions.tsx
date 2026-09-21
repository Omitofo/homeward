"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui";
import { AuthSheet } from "@/features/auth/components/AuthSheet";
import type { AuthIntent } from "@/features/auth/intent";
import type { PostStatus } from "@/types/domain";

type Props = {
  postId: string;
  status: PostStatus;
  signedIn: boolean;
};

/**
 * Like / Contact / Save on the post detail page.
 * Visitors are gated behind AuthSheet (intent preserved for magic-link return).
 * Real mutations arrive in Phase 4 (likes) and Phase 6 (chat).
 */
export function PostActions({ postId, status, signedIn }: Props) {
  const pathname = usePathname();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [intent, setIntent] = useState<AuthIntent | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  function gateOrRun(type: AuthIntent["type"], whenSignedIn: () => void) {
    if (signedIn) {
      whenSignedIn();
      return;
    }
    setIntent({
      type,
      returnTo: pathname || `/post/${postId}`,
      postId,
    });
    setSheetOpen(true);
  }

  return (
    <>
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap gap-3">
          <Button
            size="lg"
            disabled={status !== "available" && signedIn}
            onClick={() =>
              gateOrRun("contact", () =>
                setNotice(
                  "Chat with shelters ships in a later phase. You're signed in and ready when it lands.",
                ),
              )
            }
          >
            {status === "available"
              ? "Contact shelter"
              : status === "reserved"
                ? "Currently reserved"
                : "Already adopted"}
          </Button>

          <Button
            variant="secondary"
            size="lg"
            onClick={() =>
              gateOrRun("like", () =>
                setNotice(
                  "Likes are coming in Phase 4. You're signed in — this will stick then.",
                ),
              )
            }
          >
            Like
          </Button>

          <Button
            variant="ghost"
            size="lg"
            onClick={() =>
              gateOrRun("save", () =>
                setNotice("Saved animals arrive with the adopter area."),
              )
            }
          >
            Save
          </Button>
        </div>

        {notice && (
          <p className="text-sm text-muted" role="status">
            {notice}
          </p>
        )}
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
