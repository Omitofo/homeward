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
      ? "You're signed in. You can like this animal now."
      : intent.type === "contact"
        ? "You're signed in. Use Contact shelter to start a chat."
        : intent.type === "save"
          ? "You're signed in. Tap Save to keep this animal in Your account."
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
