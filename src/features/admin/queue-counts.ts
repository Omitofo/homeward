import "server-only";

import { getCurrentProfile } from "@/features/auth/session";
import { createClient } from "@/lib/supabase/server";
import { listMockOpenReports } from "@/features/moderation/mock-store";
import { listAllMockVerificationRequests } from "@/features/verification/mock-store";

const useMock = process.env.NEXT_PUBLIC_USE_MOCK_DATA !== "false";

export type AdminQueueCounts = {
  applications: number;
  verification: number;
  reports: number;
  total: number;
};

const EMPTY: AdminQueueCounts = {
  applications: 0,
  verification: 0,
  reports: 0,
  total: 0,
};

async function countRows(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  query: PromiseLike<{ count: number | null; error: { message: string } | null }>,
): Promise<number> {
  const { count, error } = await query;
  if (error) {
    console.error("[getAdminQueueCounts]", error.message);
    return 0;
  }
  return count ?? 0;
}

/**
 * Pending items in admin queues (applications, verification, reports).
 * Safe for Server Components. Returns zeros when not admin / unconfigured.
 */
export async function getAdminQueueCounts(): Promise<AdminQueueCounts> {
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== "admin") {
    return EMPTY;
  }

  if (useMock) {
    const verification = listAllMockVerificationRequests().filter(
      (r) => r.status === "pending" || r.status === "needs_info",
    ).length;
    const reports = listMockOpenReports().length;
    // Mock applications store is in-memory on the server action module; treat as 0 here.
    const applications = 0;
    return {
      applications,
      verification,
      reports,
      total: applications + verification + reports,
    };
  }

  const supabase = await createClient();
  if (!supabase) return EMPTY;

  const [applications, verification, reports] = await Promise.all([
    countRows(
      supabase
        .from("shelter_applications")
        .select("id", { count: "exact", head: true })
        .eq("status", "pending"),
    ),
    countRows(
      supabase
        .from("verification_requests")
        .select("id", { count: "exact", head: true })
        .in("status", ["pending", "needs_info"]),
    ),
    countRows(
      supabase
        .from("reports")
        .select("id", { count: "exact", head: true })
        .eq("status", "open"),
    ),
  ]);

  return {
    applications,
    verification,
    reports,
    total: applications + verification + reports,
  };
}
