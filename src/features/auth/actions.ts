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
  passwordAdopterSchema,
  passwordShelterSchema,
  passwordSignInSchema,
} from "./schema";
import { AUTH_NEXT_COOKIE, AUTH_SHELTER_INTENT_COOKIE } from "./constants";
import { ensureShelterProfile } from "./promote-shelter";
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

function mapPasswordError(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes("invalid login") || lower.includes("invalid credentials")) {
    return "Email or password is incorrect.";
  }
  if (lower.includes("email not confirmed")) {
    return "Confirm your email first (check your inbox), then sign in.";
  }
  if (lower.includes("already registered") || lower.includes("already been registered")) {
    return "An account with that email already exists. Sign in instead.";
  }
  if (lower.includes("password")) {
    return message;
  }
  if (lower.includes("rate") || lower.includes("too many")) {
    return "Too many attempts. Wait a minute and try again.";
  }
  return "Could not complete sign-in. Please try again.";
}

async function setAuthCookies(params: {
  next: string;
  shelterIntent?: { handle: string; orgName: string; displayName: string };
}) {
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
    cookieStore.set(AUTH_SHELTER_INTENT_COOKIE, "", {
      httpOnly: true,
      path: "/",
      maxAge: 0,
    });
  }
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
  const redirectTo = `${origin}/auth/callback`;

  await setAuthCookies({
    next: params.next,
    shelterIntent: params.shelterIntent,
  });

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

/** Existing user: email only (magic link). */
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

/** New adopter: email + display name (magic link). */
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
 * New shelter account via magic link. Profile is created as adopter by the DB
 * trigger; after the user confirms the link we promote role + insert shelters
 * row in the callback via ensureShelterProfile.
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

/** Existing user: email + password. Redirects on success. */
export async function signInWithPassword(
  input: unknown,
): Promise<ActionResult> {
  const parsed = passwordSignInSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  const emailKey = parsed.data.email.toLowerCase();
  const limited = rateLimit(`password-auth:${emailKey}`, RATE_LIMITS.passwordAuth);
  if (!limited.ok) {
    return {
      ok: false,
      error: `Too many attempts. Wait about ${limited.retryAfterSec}s and try again.`,
    };
  }

  const supabase = await createClient();
  if (!supabase) {
    return {
      ok: false,
      error: "Supabase is not configured. Check your .env.local keys.",
    };
  }

  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    console.error("[auth] signInWithPassword failed", error.message);
    return { ok: false, error: mapPasswordError(error.message) };
  }

  redirect(safeNextPath(parsed.data.next));
}

/**
 * New adopter with password. If email confirmation is required, returns ok
 * and the client shows "check your email". If a session is returned
 * immediately, redirects.
 */
export async function signUpAdopterWithPassword(
  input: unknown,
): Promise<ActionResult<{ needsEmailConfirm: boolean }>> {
  const parsed = passwordAdopterSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  const emailKey = parsed.data.email.toLowerCase();
  const limited = rateLimit(`password-auth:${emailKey}`, RATE_LIMITS.passwordAuth);
  if (!limited.ok) {
    return {
      ok: false,
      error: `Too many attempts. Wait about ${limited.retryAfterSec}s and try again.`,
    };
  }

  const supabase = await createClient();
  if (!supabase) {
    return {
      ok: false,
      error: "Supabase is not configured. Check your .env.local keys.",
    };
  }

  const next = safeNextPath(parsed.data.next);
  const origin = siteOrigin();

  await setAuthCookies({ next });

  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
      data: {
        display_name: parsed.data.displayName,
        intent: "adopter",
      },
    },
  });

  if (error) {
    console.error("[auth] signUp adopter password failed", error.message);
    return { ok: false, error: mapPasswordError(error.message) };
  }

  if (data.session) {
    redirect(next);
  }

  return { ok: true, data: { needsEmailConfirm: true } };
}

/**
 * New shelter with password. Promotes immediately when a session is returned;
 * otherwise relies on the intent cookie + auth/callback after email confirm.
 */
export async function signUpShelterWithPassword(
  input: unknown,
): Promise<ActionResult<{ needsEmailConfirm: boolean }>> {
  const parsed = passwordShelterSchema.safeParse(input);
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

  const emailKey = parsed.data.email.toLowerCase();
  const limited = rateLimit(`password-auth:${emailKey}`, RATE_LIMITS.passwordAuth);
  if (!limited.ok) {
    return {
      ok: false,
      error: `Too many attempts. Wait about ${limited.retryAfterSec}s and try again.`,
    };
  }

  const supabase = await createClient();
  if (!supabase) {
    return {
      ok: false,
      error: "Supabase is not configured. Check your .env.local keys.",
    };
  }

  const next = safeNextPath(parsed.data.next ?? "/studio");
  const origin = siteOrigin();
  const shelterIntent = {
    handle: parsed.data.handle,
    orgName: parsed.data.orgName,
    displayName: parsed.data.displayName,
  };

  await setAuthCookies({ next, shelterIntent });

  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
      data: {
        display_name: parsed.data.displayName,
        intent: "shelter",
        org_name: parsed.data.orgName,
        handle: parsed.data.handle,
      },
    },
  });

  if (error) {
    console.error("[auth] signUp shelter password failed", error.message);
    return { ok: false, error: mapPasswordError(error.message) };
  }

  if (data.session && data.user) {
    const promote = await ensureShelterProfile(
      data.user.id,
      data.user.user_metadata ?? {},
      shelterIntent,
    );
    if (!promote.ok) {
      return { ok: false, error: promote.error };
    }
    redirect(next);
  }

  return { ok: true, data: { needsEmailConfirm: true } };
}

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  if (supabase) {
    await supabase.auth.signOut();
  }
  redirect("/");
}
