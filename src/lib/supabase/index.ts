export { createClient as createBrowserClient } from "./client";
export { createClient as createServerClient } from "./server";
// createAdminClient is intentionally NOT re-exported from the barrel.
// Import it only from "@/lib/supabase/admin" in server code (server-only).
