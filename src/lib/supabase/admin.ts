import "server-only";

import { createClient } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Service-role client — server only. Never import from client components.
 * Used for admin tasks, seeds, and privileged ops that bypass RLS.
 *
 * SUPABASE_SERVICE_ROLE_KEY must never be prefixed with NEXT_PUBLIC_.
 */
export function createAdminClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
