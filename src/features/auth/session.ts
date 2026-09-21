import { createServerClient } from "@/lib/supabase/server";
import type { Role } from "@/types/domain";
import type { AuthProfile } from "./types";

/**
 * Returns the current auth user + profile, or null if signed out / unconfigured.
 * Safe to call from Server Components and Server Actions.
 */
export async function getCurrentProfile(): Promise<AuthProfile | null> {
  const supabase = await createServerClient();
  if (!supabase) return null;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, role, display_name, avatar_url")
    .eq("id", user.id)
    .maybeSingle();

  // Trigger may lag by a moment on brand-new accounts; fall back to metadata.
  const displayName =
    profile?.display_name ??
    (typeof user.user_metadata?.display_name === "string"
      ? user.user_metadata.display_name
      : null) ??
    user.email?.split("@")[0] ??
    "Member";

  const role = (profile?.role as Role | undefined) ?? "adopter";

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
