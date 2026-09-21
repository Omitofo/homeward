"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  magicLinkAdopterSchema,
  magicLinkShelterSchema,
  magicLinkSignInSchema,
} from "./schema";
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

async function sendMagicLink(params: {
  email: string;
  next: string;
  data?: Record<string, string>;
}): Promise<ActionResult> {
  const supabase = await createClient();
  if (!supabase) {
    return {
      ok: false,
      error: "Supabase is not configured. Check your .env.local keys.",
    };
  }

  const origin = siteOrigin();
  const redirectTo = `${origin}/auth/callback?next=${encodeURIComponent(params.next)}`;

  const { error } = await supabase.auth.signInWithOtp({
    email: params.email,
    options: {
      emailRedirectTo: redirectTo,
      data: params.data,
      shouldCreateUser: true,
    },
  });

  if (error) {
    // Generic message — avoid account enumeration.
    console.error("[auth] signInWithOtp failed", error.message);
    return {
      ok: false,
      error: "Could not send the magic link. Please try again in a moment.",
    };
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
 */
export async function signUpShelter(input: unknown): Promise<ActionResult> {
  const parsed = magicLinkShelterSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  // Soft uniqueness check (final enforcement is the unique constraint).
  const admin = createAdminClient();
  if (admin) {
    const { data: existing } = await admin
      .from("shelters")
      .select("id")
      .eq("handle", parsed.data.handle)
      .maybeSingle();
    if (existing) {
      return { ok: false, error: "That handle is already taken." };
    }
  }

  return sendMagicLink({
    email: parsed.data.email,
    next: safeNextPath(parsed.data.next),
    data: {
      display_name: parsed.data.displayName,
      intent: "shelter",
      org_name: parsed.data.orgName,
      handle: parsed.data.handle,
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
