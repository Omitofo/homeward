/** Cookie holds the post-login path so emailRedirectTo stays allowlist-stable. */
export const AUTH_NEXT_COOKIE = "homeward_auth_next";

/**
 * Pending shelter registration payload (JSON).
 * Supabase only writes `options.data` into user_metadata on *first* signup.
 * For existing accounts (or when metadata is dropped), the callback reads this cookie.
 */
export const AUTH_SHELTER_INTENT_COOKIE = "homeward_shelter_intent";
