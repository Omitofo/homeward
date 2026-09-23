"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { rateLimit, RATE_LIMITS } from "@/lib/security";
import {
  magicLinkAdopterSchema,
  magicLinkShelterSchema,
  magicLinkSignInSchema,
} from "./schema";
import { AUTH_NEXT_COOKIE, AUTH_SHELTER_INTENT_COOKIE } from "./constants";
import type { ActionResult } from "./types";

function siteOrigin(): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}

function safeNextPath(next: string | undefined): string {
  if (!next || !next.startsWith("/") || next.startsWith("//")) {
    return "/me";
  }
  return next;
}

function mapOtpError(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes("rate") || lower.includes("too many")) {
    return "Too many login emails sent. Wait a minute and try again.";
  }
  if (lower.includes("redirect") || lower.includes("not allowed")) {
    return "Login redirect is not allowed. Check Supabase Auth URL configuration.";
  }
  if (lower.includes("email") && lower.includes("invalid")) {
    return "That email address does not look valid.";
  }
  return "Could not send the magic link. Please try again in a moment.";
}

async function sendMagicLink(params: {
  email: string;
  next: string;
  data?: Record<string, string>;
  shelterIntent?: { handle: string; orgName: string; displayName: string };
}): Promise<ActionResult> {
  const limited = rateLimit(
    `magic-link:${params.email.toLowerCase()}`,
    RATE_LIMITS.magicLink,
  );
  if (!limited.ok) {
    return {
      ok: false,
      error: `Too many login emails sent. Wait about ${limited.retryAfterSec}s and try again.`,
    };
  }

  const supabase = await createClient();
  if (!supabase) {
    return {
      ok: false,
      error: "Supabase is not configured. Check your .env.local keys.",
    };
  }

  const origin = siteOrigin();
  // Bare callback URL must match Supabase redirect allowlist exactly.
  // Return path is carried in a short-lived cookie (see auth/callback).
  const redirectTo = `${origin}/auth/callback`;

  const cookieStore = await cookies();
  cookieStore.set(AUTH_NEXT_COOKIE, params.next, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 15,
    secure: process.env.NODE_ENV === "production",
  });

  if (params.shelterIntent) {
    cookieStore.set(
      AUTH_SHELTER_INTENT_COOKIE,
      JSON.stringify(params.shelterIntent),
      {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 15,
        secure: process.env.NODE_ENV === "production",
      },
    );
  } else {
    // Clear any stale shelter intent from a previous attempt
    cookieStore.set(AUTH_SHELTER_INTENT_COOKIE, "", {
      httpOnly: true,
      path: "/",
      maxAge: 0,
    });
  }

  const { error } = await supabase.auth.signInWithOtp({
    email: params.email,
    options: {
      emailRedirectTo: redirectTo,
      data: params.data,
      shouldCreateUser: true,
    },
  });

  if (error) {
    console.error("[auth] signInWithOtp failed", error.message);
    return { ok: false, error: mapOtpError(error.message) };
  }

  return { ok: true, data: undefined };
}

/** Existing user: email only. */
export async function signInWithMagicLink(
  input: unknown,
): Promise<ActionResult> {
  const parsed = magicLinkSignInSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  return sendMagicLink({
    email: parsed.data.email,
    next: safeNextPath(parsed.data.next),
  });
}

/** New adopter: email + display name. */
export async function signUpAdopter(input: unknown): Promise<ActionResult> {
  const parsed = magicLinkAdopterSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  return sendMagicLink({
    email: parsed.data.email,
    next: safeNextPath(parsed.data.next),
    data: {
      display_name: parsed.data.displayName,
      intent: "adopter",
    },
  });
}

/**
 * New shelter account. Profile is created as adopter by the DB trigger;
 * after the user confirms the link we promote role + insert shelters row
 * in the callback via ensureShelterProfile.
 *
 * Requires SUPABASE_SERVICE_ROLE_KEY — role is never client-writable.
 */
export async function signUpShelter(input: unknown): Promise<ActionResult> {
  const parsed = magicLinkShelterSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  const admin = createAdminClient();
  if (!admin) {
    return {
      ok: false,
      error:
        "Shelter sign-up needs SUPABASE_SERVICE_ROLE_KEY in .env.local (server-only). Copy it from Supabase → Project Settings → API.",
    };
  }

  const { data: existing } = await admin
    .from("shelters")
    .select("id")
    .eq("handle", parsed.data.handle)
    .maybeSingle();
  if (existing) {
    return { ok: false, error: "That handle is already taken." };
  }

  return sendMagicLink({
    email: parsed.data.email,
    next: safeNextPath(parsed.data.next ?? "/studio"),
    data: {
      display_name: parsed.data.displayName,
      intent: "shelter",
      org_name: parsed.data.orgName,
      handle: parsed.data.handle,
    },
    shelterIntent: {
      handle: parsed.data.handle,
      orgName: parsed.data.orgName,
      displayName: parsed.data.displayName,
    },
  });
}

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  if (supabase) {
    await supabase.auth.signOut();
  }
  redirect("/");
}
