"use client";

import { useEffect, useState } from "react";
import { Sheet } from "@/components/ui";
import { MagicLinkForm } from "./MagicLinkForm";
import {
  type AuthIntent,
  intentBenefitCopy,
  setPendingIntent,
} from "../intent";

type SheetMode = "signin" | "adopter";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Action the visitor was trying to perform */
  intent?: AuthIntent | null;
  /** Fallback return path when no intent is set */
  next?: string;
};

export function AuthSheet({ open, onOpenChange, intent, next }: Props) {
  const [mode, setMode] = useState<SheetMode>("adopter");

  const returnTo = intent?.returnTo ?? next ?? "/explore";
  const benefit = intent
    ? intentBenefitCopy(intent.type)
    : "Sign in with a magic link — no password needed.";

  useEffect(() => {
    if (open && intent) {
      setPendingIntent(intent);
    }
  }, [open, intent]);

  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
      title={mode === "signin" ? "Sign in" : "Join Homeward"}
    >
      <p className="mb-4 text-sm text-muted">{benefit}</p>

      <div className="mb-4 flex gap-1 rounded-md border border-border bg-secondary p-1">
        <button
          type="button"
          className={
            mode === "adopter"
              ? "flex-1 rounded px-3 py-1.5 text-sm font-medium bg-card text-foreground shadow-sm"
              : "flex-1 rounded px-3 py-1.5 text-sm font-medium text-muted hover:text-foreground"
          }
          onClick={() => setMode("adopter")}
        >
          New account
        </button>
        <button
          type="button"
          className={
            mode === "signin"
              ? "flex-1 rounded px-3 py-1.5 text-sm font-medium bg-card text-foreground shadow-sm"
              : "flex-1 rounded px-3 py-1.5 text-sm font-medium text-muted hover:text-foreground"
          }
          onClick={() => setMode("signin")}
        >
          Sign in
        </button>
      </div>

      <MagicLinkForm
        mode={mode === "signin" ? "signin" : "adopter"}
        next={returnTo}
      />

      <p className="mt-4 text-center text-xs text-muted">
        Represent a rescue?{" "}
        <a
          href="/register/shelter"
          className="font-medium text-primary hover:underline"
        >
          Shelter sign-up
        </a>
      </p>
    </Sheet>
  );
}
