"use client";

import { useEffect, useState } from "react";
import {
  clearPendingIntent,
  getPendingIntent,
  type AuthIntent,
} from "../intent";

type Props = {
  /** Only resume when the visitor is signed in */
  signedIn: boolean;
};

/**
 * After magic-link return, surface a short confirmation for the pending intent.
 * Real action completion (like / contact) lands in Phase 4 / 6.
 */
export function IntentResume({ signedIn }: Props) {
  const [intent, setIntent] = useState<AuthIntent | null>(null);

  useEffect(() => {
    if (!signedIn) return;
    const pending = getPendingIntent();
    if (!pending) return;
    setIntent(pending);
    clearPendingIntent();
  }, [signedIn]);

  if (!intent) return null;

  const message =
    intent.type === "like"
      ? "You're signed in. Likes go live in the next engagement phase — this animal is ready when they do."
      : intent.type === "contact"
        ? "You're signed in. Messaging the shelter will open here once chat ships."
        : intent.type === "save"
          ? "You're signed in. Saved animals arrive with the adopter area."
          : "You're signed in. You can continue where you left off.";

  return (
    <div
      className="rounded-lg border border-primary/30 bg-primary/5 px-4 py-3 text-sm text-foreground"
      role="status"
    >
      <p className="font-medium">Welcome back</p>
      <p className="mt-1 text-muted">{message}</p>
    </div>
  );
}
