import type { Metadata } from "next";
import Link from "next/link";
import { EmptyState } from "@/components/ui";
import { requireAdminContext } from "@/features/admin";
import {
  AdminReviewCard,
  listPendingVerificationRequests,
} from "@/features/verification";

export const metadata: Metadata = {
  title: "Verification queue · Admin",
  robots: { index: false, follow: false },
};

export default async function AdminVerificationPage() {
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

  const result = await listPendingVerificationRequests();
  const queue = result.ok ? result.data : [];

  return (
    <main id="main-content" className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">
          Verification queue
        </h1>
        <p className="text-xs text-muted">Signed in as {ctx.profile.displayName}</p>
      </div>
      <p className="text-sm text-muted">
        Review rescue evidence, then approve, reject, or request more info.
        Decisions update the public Verified badge immediately.
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
            description="No pending verification requests right now."
          />
        </div>
      ) : null}

      {queue.length > 0 ? (
        <ul className="mt-8 space-y-4">
          {queue.map((row) => (
            <li key={row.id}>
              <AdminReviewCard row={row} />
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
