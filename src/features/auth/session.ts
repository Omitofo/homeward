import { createClient } from "@/lib/supabase/server";
import type { Role } from "@/types/domain";
import type { AuthProfile } from "./types";

const ROLES: readonly Role[] = ["adopter", "shelter", "admin"] as const;

function asRole(value: unknown): Role | null {
  if (typeof value === "string" && (ROLES as readonly string[]).includes(value)) {
    return value as Role;
  }
  return null;
}

/**
 * Returns the current auth user + profile, or null if signed out / unconfigured.
 * Safe to call from Server Components and Server Actions.
 */
export async function getCurrentProfile(): Promise<AuthProfile | null> {
  const supabase = await createClient();
  if (!supabase) return null;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, role, display_name, avatar_url, deleted_at")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    console.error("[auth] profiles select failed", profileError.message);
  }

  // Soft-deleted accounts: still authenticated until sign-out, but flag role
  // from DB when visible. RLS hides deleted rows — treat as missing profile.
  if (!profile) {
    console.warn(
      "[auth] no visible profiles row for user; defaulting role to adopter",
      { userId: user.id, email: user.email },
    );
  }

  const displayName =
    profile?.display_name ??
    (typeof user.user_metadata?.display_name === "string"
      ? user.user_metadata.display_name
      : null) ??
    user.email?.split("@")[0] ??
    "Member";

  const role =
    asRole(profile?.role) ??
    asRole(user.user_metadata?.role) ??
    "adopter";

  return {
    id: user.id,
    email: user.email ?? null,
    role,
    displayName,
    avatarUrl: profile?.avatar_url ?? null,
  };
}

/** True when a valid session cookie is present. */
export async function isAuthenticated(): Promise<boolean> {
  const profile = await getCurrentProfile();
  return profile !== null;
}
