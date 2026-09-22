import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/features/auth";
import type { AuthProfile } from "@/features/auth";

/**
 * Server-only guard for /admin/*.
 * Redirects visitors to login; returns null when signed in but not admin
 * (caller renders a blocked state).
 */
export async function requireAdminContext(): Promise<
  { profile: AuthProfile } | null
> {
  const profile = await getCurrentProfile();
  if (!profile) {
    redirect("/login?next=/admin/verification");
  }

  if (profile.role !== "admin") {
    return null;
  }

  return { profile };
}
