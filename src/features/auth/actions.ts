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
import { submitShelterApplication } from "./promote-shelter";
import type { ActionResult } from "./types";

type ShelterIntentCookie = {
  handle: string;
  orgName: string;
  displayName: string;
  website?: string;
  countryCode?: string;
  message?: string;
};

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
  shelterIntent?: ShelterIntentCookie;
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
  shelterIntent?: ShelterIntentCookie;
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
 * Request to join as a shelter (magic link). Creates an adopter account;
 * after email confirm the callback inserts a pending shelter_applications row.
 * Admin must approve before role=shelter / Studio access.
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
        "Shelter applications need SUPABASE_SERVICE_ROLE_KEY in .env.local (server-only). Copy it from Supabase → Project Settings → API.",
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

  const { data: pendingHandle } = await admin
    .from("shelter_applications")
    .select("id")
    .eq("handle", parsed.data.handle)
    .eq("status", "pending")
    .maybeSingle();
  if (pendingHandle) {
    return {
      ok: false,
      error: "That handle is reserved by another pending application.",
    };
  }

  const website = (parsed.data.website ?? "").trim();
  const countryCode =
    (parsed.data.countryCode ?? "XX").trim().toUpperCase() || "XX";
  const message = (parsed.data.message ?? "").trim();

  return sendMagicLink({
    email: parsed.data.email,
    next: safeNextPath(parsed.data.next ?? "/me?applied=shelter"),
    data: {
      display_name: parsed.data.displayName,
      intent: "shelter",
      org_name: parsed.data.orgName,
      handle: parsed.data.handle,
      website,
      country_code: countryCode,
      message,
    },
    shelterIntent: {
      handle: parsed.data.handle,
      orgName: parsed.data.orgName,
      displayName: parsed.data.displayName,
      website,
      countryCode,
      message,
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
 * Request to join as a shelter with password.
 * Creates an adopter account and a pending shelter_applications row.
 * Does NOT promote to role=shelter until an admin approves.
 */
export async function signUpShelterWithPassword(
  input: unknown,
): Promise<
  ActionResult<{ needsEmailConfirm: boolean; applicationSubmitted?: boolean }>
> {
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
        "Shelter applications need SUPABASE_SERVICE_ROLE_KEY in .env.local (server-only). Copy it from Supabase → Project Settings → API.",
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

  const { data: pendingHandle } = await admin
    .from("shelter_applications")
    .select("id")
    .eq("handle", parsed.data.handle)
    .eq("status", "pending")
    .maybeSingle();
  if (pendingHandle) {
    return {
      ok: false,
      error: "That handle is reserved by another pending application.",
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

  const next = safeNextPath(parsed.data.next ?? "/me?applied=shelter");
  const origin = siteOrigin();
  const website = (parsed.data.website ?? "").trim();
  const countryCode =
    (parsed.data.countryCode ?? "XX").trim().toUpperCase() || "XX";
  const message = (parsed.data.message ?? "").trim();
  const shelterIntent: ShelterIntentCookie = {
    handle: parsed.data.handle,
    orgName: parsed.data.orgName,
    displayName: parsed.data.displayName,
    website,
    countryCode,
    message,
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
        website,
        country_code: countryCode,
        message,
      },
    },
  });

  if (error) {
    console.error("[auth] signUp shelter password failed", error.message);
    return { ok: false, error: mapPasswordError(error.message) };
  }

  if (data.session && data.user) {
    const applied = await submitShelterApplication(
      data.user.id,
      data.user.user_metadata ?? {},
      shelterIntent,
    );
    if (!applied.ok) {
      return { ok: false, error: applied.error };
    }
    return {
      ok: true,
      data: { needsEmailConfirm: false, applicationSubmitted: true },
    };
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
