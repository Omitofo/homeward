"use client";

import { useState, type FormEvent } from "react";
import { Button, Input } from "@/components/ui";
import {
  signInWithMagicLink,
  signInWithPassword,
  signUpAdopter,
  signUpAdopterWithPassword,
  signUpShelter,
  signUpShelterWithPassword,
} from "../actions";

type Mode = "signin" | "adopter" | "shelter";
type Method = "password" | "magic";

type Props = {
  mode: Mode;
  next?: string;
  defaultMethod?: Method;
};

export function MagicLinkForm({
  mode,
  next,
  defaultMethod = "password",
}: Props) {
  const [method, setMethod] = useState<Method>(defaultMethod);
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
    const password = String(form.get("password") ?? "");
    const displayName = String(form.get("displayName") ?? "");
    const orgName = String(form.get("orgName") ?? "");
    const handle = String(form.get("handle") ?? "");
    const website = String(form.get("website") ?? "");
    const countryCode = String(form.get("countryCode") ?? "");
    const appMessage = String(form.get("message") ?? "");

    try {
      if (method === "password") {
        if (mode === "signin") {
          const result = await signInWithPassword({ email, password, next });
          if (result && !result.ok) {
            setError(result.error);
          }
        } else if (mode === "adopter") {
          const result = await signUpAdopterWithPassword({
            email,
            password,
            displayName,
            next,
          });
          if (!result.ok) {
            setError(result.error);
          } else if (result.data?.needsEmailConfirm) {
            setSent(true);
            setMessage(
              "Check your email to confirm your account, then sign in with your password.",
            );
          }
        } else {
          const result = await signUpShelterWithPassword({
            email,
            password,
            displayName,
            orgName,
            handle,
            website,
            countryCode,
            message: appMessage,
            next,
          });
          if (!result.ok) {
            setError(result.error);
          } else if (result.data?.needsEmailConfirm) {
            setSent(true);
            setMessage(
              "Check your email to confirm your account. Your shelter application is queued after confirmation — we review every request before Studio access.",
            );
          } else if (result.data?.applicationSubmitted) {
            setSent(true);
            setMessage(
              "Application submitted. We review requests before activating shelter accounts. You can sign in as an adopter meanwhile; Studio unlocks after approval.",
            );
          }
        }
      } else {
        let result;
        if (mode === "signin") {
          result = await signInWithMagicLink({ email, next });
        } else if (mode === "adopter") {
          result = await signUpAdopter({ email, displayName, next });
        } else {
          result = await signUpShelter({
            email,
            displayName,
            orgName,
            handle,
            website,
            countryCode,
            message: appMessage,
            next,
          });
        }

        if (!result.ok) {
          setError(result.error);
        } else {
          setSent(true);
          setMessage(
            mode === "shelter"
              ? "Check your email for a magic link. After you confirm, your application is queued for review — not activated automatically."
              : "Check your email for a magic link. You can close this tab after you click it.",
          );
        }
      }
    } catch {
      // Next.js redirect() throws; ignore so navigation proceeds.
    } finally {
      setPending(false);
    }
  }

  if (sent) {
    return (
      <div
        className="rounded-lg border border-border bg-card p-4 text-sm text-foreground"
        role="status"
      >
        <p className="font-medium">
          {mode === "shelter"
            ? "Application received"
            : method === "magic"
              ? "Magic link sent"
              : "Confirm your email"}
        </p>
        <p className="mt-1 text-muted">{message}</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <div className="flex gap-1 rounded-md border border-border bg-secondary p-1">
        <button
          type="button"
          className={
            method === "password"
              ? "flex-1 rounded px-3 py-1.5 text-sm font-medium bg-card text-foreground shadow-sm"
              : "flex-1 rounded px-3 py-1.5 text-sm font-medium text-muted hover:text-foreground"
          }
          onClick={() => {
            setMethod("password");
            setError(null);
            setMessage(null);
          }}
        >
          Password
        </button>
        <button
          type="button"
          className={
            method === "magic"
              ? "flex-1 rounded px-3 py-1.5 text-sm font-medium bg-card text-foreground shadow-sm"
              : "flex-1 rounded px-3 py-1.5 text-sm font-medium text-muted hover:text-foreground"
          }
          onClick={() => {
            setMethod("magic");
            setError(null);
            setMessage(null);
          }}
        >
          Magic link
        </button>
      </div>

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
            hint="Lowercase letters, numbers, hyphens. Used in your public URL after approval."
          />
          <Input
            name="countryCode"
            label="Country code"
            maxLength={2}
            placeholder="DE"
            hint="ISO two-letter code (e.g. ES, DE, US)."
          />
          <Input
            name="website"
            label="Website or social (optional)"
            maxLength={300}
            placeholder="https://…"
          />
          <div className="flex flex-col gap-1.5">
            <label htmlFor="message" className="text-sm font-medium">
              Why should we approve you? (optional)
            </label>
            <textarea
              id="message"
              name="message"
              rows={3}
              maxLength={2000}
              placeholder="Brief context: years active, location, registration number…"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
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

      {method === "password" && (
        <Input
          name="password"
          type="password"
          label="Password"
          autoComplete={mode === "signin" ? "current-password" : "new-password"}
          required
          minLength={8}
          maxLength={72}
          placeholder="At least 8 characters"
          hint={
            mode === "signin"
              ? undefined
              : "Min 8 characters. You can sign in with this later."
          }
        />
      )}

      {error && (
        <p className="text-sm text-danger" role="alert">
          {error}
        </p>
      )}

      <Button type="submit" disabled={pending} className="w-full">
        {pending
          ? method === "magic"
            ? "Sending…"
            : mode === "signin"
              ? "Signing in…"
              : mode === "shelter"
                ? "Submitting application…"
                : "Creating account…"
          : method === "magic"
            ? "Send magic link"
            : mode === "signin"
              ? "Sign in"
              : mode === "shelter"
                ? "Submit application"
                : "Create account"}
      </Button>

      {method === "magic" && (
        <p className="text-center text-xs text-muted">
          Free-tier email limits apply (~2/hour). Prefer password when you can.
        </p>
      )}
    </form>
  );
}
