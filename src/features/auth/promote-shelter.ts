import { createAdminClient } from "@/lib/supabase/admin";

export type ShelterMeta = {
  intent?: unknown;
  handle?: unknown;
  org_name?: unknown;
  display_name?: unknown;
};

/**
 * Promote a brand-new shelter account after magic-link confirmation.
 * Uses the service-role client because `role` must not be client-writable.
 * Safe to call with the user object returned from exchangeCodeForSession.
 */
export async function ensureShelterProfile(
  userId: string,
  meta: ShelterMeta,
): Promise<void> {
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
