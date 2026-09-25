import type { Metadata } from "next";
import Link from "next/link";
import { EmptyState } from "@/components/ui";
import { requireAdminContext } from "@/features/admin";
import {
  AdminApplicationCard,
  listPendingShelterApplications,
} from "@/features/shelter-applications";

export const metadata: Metadata = {
  title: "Shelter applications · Admin",
  robots: { index: false, follow: false },
};

export default async function AdminShelterApplicationsPage() {
  const ctx = await requireAdminContext();
  if (!ctx) {
    return (
      <main id="main-content" className="mx-auto max-w-3xl px-4 py-10">
        <EmptyState
          title="Admins only"
          description="This queue is restricted to Homeward administrators."
        />
        <p className="mt-6 text-center text-sm">
          <Link href="/" className="font-medium text-primary hover:underline">
            ← Home
          </Link>
        </p>
      </main>
    );
  }

  const result = await listPendingShelterApplications();
  const queue = result.ok ? result.data : [];

  return (
    <main id="main-content" className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">
          Shelter applications
        </h1>
        <p className="text-xs text-muted">Signed in as {ctx.profile.displayName}</p>
      </div>
      <p className="text-sm text-muted">
        Review request-to-join applications. Approving creates the shelter
        account (Studio access). The Verified badge is a separate step after
        they join.
      </p>
      <p className="mt-2 text-xs text-muted">
        Tip: call or email the rescue off-platform before approving if you need
        extra confidence.{" "}
        <Link href="/admin/verification" className="text-primary hover:underline">
          Verification queue →
        </Link>
      </p>

      {!result.ok ? (
        <p className="mt-8 text-sm text-danger" role="alert">
          {result.error}
        </p>
      ) : null}

      {result.ok && queue.length === 0 ? (
        <div className="mt-10">
          <EmptyState
            title="Queue is empty"
            description="No pending shelter applications right now."
          />
        </div>
      ) : null}

      {queue.length > 0 ? (
        <ul className="mt-8 space-y-4">
          {queue.map((row) => (
            <li key={row.id}>
              <AdminApplicationCard row={row} />
            </li>
          ))}
        </ul>
      ) : null}

      <p className="mt-10 text-sm">
        <Link href="/" className="font-medium text-primary hover:underline">
          ← Home
        </Link>
      </p>
    </main>
  );
}
