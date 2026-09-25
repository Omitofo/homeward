import { createAdminClient } from "@/lib/supabase/admin";

export type ShelterMeta = {
  intent?: unknown;
  handle?: unknown;
  org_name?: unknown;
  display_name?: unknown;
  website?: unknown;
  country_code?: unknown;
  message?: unknown;
};

export type ShelterIntentPayload = {
  handle: string;
  orgName: string;
  displayName?: string;
  website?: string;
  countryCode?: string;
  message?: string;
};

function asNonEmptyString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

/**
 * After shelter-intent sign-up, create a pending application instead of
 * promoting the user to role=shelter. Admin must approve before Studio access.
 */
export async function submitShelterApplication(
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
  const website =
    asNonEmptyString(meta.website) ?? cookieIntent?.website ?? "";
  const countryCode = (
    asNonEmptyString(meta.country_code) ??
    cookieIntent?.countryCode ??
    "XX"
  )
    .slice(0, 2)
    .toUpperCase();
  const message =
    asNonEmptyString(meta.message) ?? cookieIntent?.message ?? "";

  if (!handle || !orgName) {
    console.error(
      "[auth] shelter application skipped: missing handle/org_name",
      { userId, meta, cookieIntent },
    );
    return {
      ok: false,
      error: "Shelter application data was incomplete. Try again.",
    };
  }

  const admin = createAdminClient();
  if (!admin) {
    console.error(
      "[auth] SUPABASE_SERVICE_ROLE_KEY missing; cannot submit shelter application",
    );
    return {
      ok: false,
      error:
        "Server is missing SUPABASE_SERVICE_ROLE_KEY. Applications cannot be stored until it is set.",
    };
  }

  const { data: existingShelter } = await admin
    .from("shelters")
    .select("id")
    .eq("profile_id", userId)
    .maybeSingle();
  if (existingShelter) {
    return { ok: true };
  }

  const { data: handleTaken } = await admin
    .from("shelters")
    .select("id")
    .eq("handle", handle)
    .maybeSingle();
  if (handleTaken) {
    return { ok: false, error: "That handle is already taken." };
  }

  const { data: existingApp } = await admin
    .from("shelter_applications")
    .select("id")
    .eq("applicant_id", userId)
    .eq("status", "pending")
    .maybeSingle();
  if (existingApp) {
    return { ok: true };
  }

  const { data: pendingHandle } = await admin
    .from("shelter_applications")
    .select("id")
    .eq("handle", handle)
    .eq("status", "pending")
    .maybeSingle();
  if (pendingHandle) {
    return {
      ok: false,
      error: "That handle is reserved by another pending application.",
    };
  }

  const { error: insertError } = await admin.from("shelter_applications").insert({
    applicant_id: userId,
    handle,
    org_name: orgName,
    display_name: displayName ?? "",
    country_code: countryCode || "XX",
    website: website ?? "",
    message: message ?? "",
    status: "pending",
  });

  if (insertError) {
    console.error("[auth] shelter application insert failed", insertError.message);
    if (
      insertError.message.includes("unique") ||
      insertError.code === "23505"
    ) {
      return {
        ok: false,
        error:
          "You already have a pending application, or that handle is taken.",
      };
    }
    return {
      ok: false,
      error:
        "Could not submit shelter application. Apply migration 20260925140000 in Supabase, then try again.",
    };
  }

  return { ok: true };
}

/** @deprecated Use submitShelterApplication — alias during transition. */
export const ensureShelterProfile = submitShelterApplication;
