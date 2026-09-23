import { createAdminClient } from "@/lib/supabase/admin";

export type ShelterMeta = {
  intent?: unknown;
  handle?: unknown;
  org_name?: unknown;
  display_name?: unknown;
};

export type ShelterIntentPayload = {
  handle: string;
  orgName: string;
  displayName?: string;
};

function asNonEmptyString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

/**
 * Promote (or complete) a shelter account after sign-up confirmation.
 * Uses the service-role client + admin_promote_shelter RPC (SECURITY DEFINER)
 * so profiles.role can change even when the lock trigger does not see a
 * service_role JWT claim correctly.
 */
export async function ensureShelterProfile(
  userId: string,
  meta: ShelterMeta,
  cookieIntent?: ShelterIntentPayload | null,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const intentFromMeta = asNonEmptyString(meta.intent);
  const wantsShelter =
    intentFromMeta === "shelter" || cookieIntent != null;

  if (!wantsShelter) {
    return { ok: true };
  }

  const handle =
    asNonEmptyString(meta.handle) ?? cookieIntent?.handle ?? null;
  const orgName =
    asNonEmptyString(meta.org_name) ?? cookieIntent?.orgName ?? null;
  const displayName =
    asNonEmptyString(meta.display_name) ?? cookieIntent?.displayName ?? null;

  if (!handle || !orgName) {
    console.error(
      "[auth] shelter promote skipped: missing handle/org_name",
      { userId, meta, cookieIntent },
    );
    return {
      ok: false,
      error: "Shelter sign-up data was incomplete. Try registering again.",
    };
  }

  const admin = createAdminClient();
  if (!admin) {
    console.error(
      "[auth] SUPABASE_SERVICE_ROLE_KEY missing; cannot promote shelter",
    );
    return {
      ok: false,
      error:
        "Server is missing SUPABASE_SERVICE_ROLE_KEY. Shelter accounts cannot be created until it is set in .env.local.",
    };
  }

  const { error: rpcError } = await admin.rpc("admin_promote_shelter", {
    p_user_id: userId,
    p_handle: handle,
    p_org_name: orgName,
    p_display_name: displayName,
  });

  if (!rpcError) {
    return { ok: true };
  }

  console.error("[auth] admin_promote_shelter RPC failed", rpcError.message);

  // Fallback for projects that have not applied the RPC migration yet.
  const { data: existingShelter, error: existingErr } = await admin
    .from("shelters")
    .select("id")
    .eq("profile_id", userId)
    .maybeSingle();

  if (existingErr) {
    console.error("[auth] shelter lookup failed", existingErr.message);
    return {
      ok: false,
      error:
        "Could not promote shelter. Apply migration 20260923200000_promote_shelter_rpc.sql in Supabase, then try again.",
    };
  }

  const profileUpdate: { role: "shelter"; display_name?: string; deleted_at: null } =
    {
      role: "shelter",
      deleted_at: null,
    };
  if (displayName) profileUpdate.display_name = displayName;

  const { error: roleError } = await admin
    .from("profiles")
    .update(profileUpdate)
    .eq("id", userId);

  if (roleError) {
    console.error("[auth] role promote fallback failed", roleError.message);
    return {
      ok: false,
      error:
        "Could not set shelter role. Run supabase/migrations/20260923200000_promote_shelter_rpc.sql in the SQL editor, then register again.",
    };
  }

  if (existingShelter) {
    return { ok: true };
  }

  const { error: insertError } = await admin.from("shelters").insert({
    profile_id: userId,
    handle,
    org_name: orgName,
    bio: "",
    country_code: "XX",
    region: "",
    city: "",
    verification_status: "unverified",
  });

  if (insertError) {
    console.error("[auth] shelter insert failed", insertError.message);
    return {
      ok: false,
      error:
        insertError.message.includes("unique") ||
        insertError.code === "23505"
          ? "That handle is already taken. Choose another and register again."
          : "Could not create shelter profile. Try again.",
    };
  }

  return { ok: true };
}
