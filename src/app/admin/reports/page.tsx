import type { Metadata } from "next";
import Link from "next/link";
import { EmptyState } from "@/components/ui";
import { requireAdminContext } from "@/features/admin";
import { AdminReportCard, listOpenReports } from "@/features/moderation";

export const metadata: Metadata = {
  title: "Reports · Admin",
  robots: { index: false, follow: false },
};

export default async function AdminReportsPage() {
  const ctx = await requireAdminContext();
  if (!ctx) {
    return (
      <main id="main-content" className="mx-auto max-w-3xl px-4 py-10">
        <EmptyState
          title="Admins only"
          description="The reports queue is restricted to administrators."
        />
        <p className="mt-6 text-center text-sm">
          <Link href="/" className="font-medium text-primary hover:underline">
            ← Home
          </Link>
        </p>
      </main>
    );
  }

  const result = await listOpenReports();
  const queue = result.ok ? result.data : [];

  return (
    <main id="main-content" className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-semibold tracking-tight">Reports</h1>
      <p className="mt-1 text-sm text-muted">
        Review user reports. Dismiss noise, hide abusive comments, or archive
        posts. Hide and archive use the service-role key when configured.
      </p>

      {!result.ok ? (
        <p className="mt-8 text-sm text-danger" role="alert">
          {result.error}
        </p>
      ) : null}

      {result.ok && queue.length === 0 ? (
        <div className="mt-10">
          <EmptyState
            title="No open reports"
            description="The moderation queue is clear."
          />
        </div>
      ) : null}

      {queue.length > 0 ? (
        <ul className="mt-8 space-y-4">
          {queue.map((row) => (
            <li key={row.id}>
              <AdminReportCard row={row} />
            </li>
          ))}
        </ul>
      ) : null}

      <p className="mt-10 text-sm">
        <Link href="/admin" className="font-medium text-primary hover:underline">
          ← Command center
        </Link>
      </p>
    </main>
  );
}
