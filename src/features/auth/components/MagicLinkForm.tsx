"use client";

import { useState, type FormEvent } from "react";
import { Button, Input } from "@/components/ui";
import {
  signInWithMagicLink,
  signUpAdopter,
  signUpShelter,
} from "../actions";

type Mode = "signin" | "adopter" | "shelter";

type Props = {
  mode: Mode;
  next?: string;
};

export function MagicLinkForm({ mode, next }: Props) {
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);
    setMessage(null);

    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") ?? "");
    const displayName = String(form.get("displayName") ?? "");
    const orgName = String(form.get("orgName") ?? "");
    const handle = String(form.get("handle") ?? "");

    let result;
    if (mode === "signin") {
      result = await signInWithMagicLink({ email, next });
    } else if (mode === "adopter") {
      result = await signUpAdopter({ email, displayName, next });
    } else {
      result = await signUpShelter({ email, displayName, orgName, handle, next });
    }

    setPending(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    setSent(true);
    setMessage(
      "Check your email for a magic link. You can close this tab after you click it.",
    );
  }

  if (sent) {
    return (
      <div
        className="rounded-lg border border-border bg-card p-4 text-sm text-foreground"
        role="status"
      >
        <p className="font-medium">Magic link sent</p>
        <p className="mt-1 text-muted">{message}</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      {mode !== "signin" && (
        <Input
          name="displayName"
          label="Your name"
          autoComplete="name"
          required
          maxLength={80}
          placeholder="Alex Rivera"
        />
      )}

      {mode === "shelter" && (
        <>
          <Input
            name="orgName"
            label="Organization name"
            required
            maxLength={120}
            placeholder="Berlin Paws"
          />
          <Input
            name="handle"
            label="Profile handle"
            required
            maxLength={32}
            placeholder="berlin-paws"
            hint="Lowercase letters, numbers, hyphens. Used in your public URL."
          />
        </>
      )}

      <Input
        name="email"
        type="email"
        label="Email"
        autoComplete="email"
        required
        maxLength={254}
        placeholder="you@example.com"
      />

      {error && (
        <p className="text-sm text-danger" role="alert">
          {error}
        </p>
      )}

      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Sending…" : "Send magic link"}
      </Button>
    </form>
  );
}
