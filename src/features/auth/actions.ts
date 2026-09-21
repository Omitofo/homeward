"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
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
  const supabase = await createServerClient();
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
  const supabase = await createServerClient();
  if (supabase) {
    await supabase.auth.signOut();
  }
  redirect("/");
}

/**
 * Called from the auth callback after a successful session exchange.
 * If the user signed up as a shelter, promote role and create the shelters row.
 * Uses the service-role client because `role` must not be client-writable.
 */
export async function ensureShelterProfile(userId: string): Promise<void> {
  const supabase = await createServerClient();
  if (!supabase) return;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || user.id !== userId) return;

  const meta = user.user_metadata ?? {};
  if (meta.intent !== "shelter") return;

  const handle = typeof meta.handle === "string" ? meta.handle : null;
  const orgName = typeof meta.org_name === "string" ? meta.org_name : null;
  const displayName =
    typeof meta.display_name === "string" ? meta.display_name : null;

  if (!handle || !orgName) return;

  const admin = createAdminClient();
  if (!admin) {
    console.error("[auth] service role missing; cannot promote shelter");
    return;
  }

  // Already a shelter?
  const { data: existingShelter } = await admin
    .from("shelters")
    .select("id")
    .eq("profile_id", userId)
    .maybeSingle();
  if (existingShelter) return;

  if (displayName) {
    await admin
      .from("profiles")
      .update({ role: "shelter", display_name: displayName })
      .eq("id", userId);
  } else {
    await admin.from("profiles").update({ role: "shelter" }).eq("id", userId);
  }

  const { error } = await admin.from("shelters").insert({
    profile_id: userId,
    handle,
    org_name: orgName,
    bio: "",
    country_code: "XX",
    region: "",
    city: "",
    verification_status: "unverified",
  });

  if (error) {
    console.error("[auth] shelter insert failed", error.message);
  }
}

/** Used only so the callback can read the request origin if needed. */
export async function getRequestOrigin(): Promise<string> {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "http";
  if (host) return `${proto}://${host}`;
  return siteOrigin();
}
