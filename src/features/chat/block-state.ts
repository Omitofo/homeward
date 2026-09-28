"use server";

import { getCurrentProfile } from "@/features/auth/session";
import { createClient } from "@/lib/supabase/server";

const useMock = process.env.NEXT_PUBLIC_USE_MOCK_DATA !== "false";

/**
 * Whether the current user has blocked the shelter that owns a listing.
 * Used on post pages to offer Unblock as an escape hatch.
 */
export async function getBlockStateForShelter(shelterId: string): Promise<{
  peerId: string | null;
  blockedByMe: boolean;
}> {
  const profile = await getCurrentProfile();
  if (!profile || !shelterId) {
    return { peerId: null, blockedByMe: false };
  }

  if (useMock) {
    return { peerId: `profile-${shelterId}`, blockedByMe: false };
  }

  const supabase = await createClient();
  if (!supabase) return { peerId: null, blockedByMe: false };

  const { data: shelter } = await supabase
    .from("shelters")
    .select("profile_id")
    .eq("id", shelterId)
    .maybeSingle();

  const peerId = (shelter?.profile_id as string | undefined) ?? null;
  if (!peerId) return { peerId: null, blockedByMe: false };

  const { data: block } = await supabase
    .from("profile_blocks")
    .select("blocker_id")
    .eq("blocker_id", profile.id)
    .eq("blocked_id", peerId)
    .maybeSingle();

  return { peerId, blockedByMe: Boolean(block) };
}
