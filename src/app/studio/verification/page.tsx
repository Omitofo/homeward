import type { Metadata } from "next";
import Link from "next/link";
import { Badge, EmptyState, VerifiedBadge } from "@/components/ui";
import { requireShelterContext, StudioNav } from "@/features/studio";
import {
  listOwnVerificationRequests,
  VerificationRequestForm,
} from "@/features/verification";

export const metadata: Metadata = {
  title: "Verification · Studio",
  robots: { index: false, follow: false },
};

export default async function StudioVerificationPage() {
  const ctx = await requireShelterContext();
  if (!ctx) return null;

  if (!ctx.shelter) {
    return (
      <>
        <StudioNav pathname="/studio/verification" />
        <main id="main-content" className="mx-auto max-w-3xl px-4 py-10">
          <EmptyState
            title="Studio is for rescue accounts"
            description="Verification is available after you register as a shelter."
          />
        </main>
      </>
    );
  }

  const { shelter } = ctx;
  const status = shelter.verificationStatus;
  const historyResult = await listOwnVerificationRequests();
  const history = historyResult.ok ? historyResult.data : [];

  const canRequest =
    status === "unverified" || status === "rejected";

  return (
    <>
      <StudioNav pathname="/studio/verification" orgName={shelter.orgName} />
      <main id="main-content" className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="text-2xl font-semibold tracking-tight">Verification</h1>
        <p className="mt-1 text-sm text-muted">
          The Verified badge is granted by Homeward admins after reviewing your
          rescue. Documents stay private.
        </p>

        <div className="mt-8 rounded-lg border border-border bg-card p-5">
          <p className="text-sm text-muted">Current status</p>
          <div className="mt-2 flex items-center gap-2">
            {status === "verified" ? (
              <VerifiedBadge />
            ) : (
              <Badge variant="neutral">{status}</Badge>
            )}
          </div>

          {status === "unverified" && (
            <p className="mt-4 text-sm text-muted">
              Submit a request with supporting documents. We review manually and
              update this page when a decision is made.
            </p>
          )}
          {status === "pending" && (
            <p className="mt-4 text-sm text-muted">
              Your request is in the admin queue. We will update this page when a
              decision is made.
            </p>
          )}
          {status === "verified" && (
            <p className="mt-4 text-sm text-muted">
              Your rescue is verified. Thank you for the trust you build with
              adopters.
            </p>
          )}
          {status === "rejected" && (
            <p className="mt-4 text-sm text-muted">
              A previous request was not approved. You can submit a new request
              with updated documents below.
            </p>
          )}
        </div>

        {canRequest ? (
          <section className="mt-8 rounded-lg border border-border bg-card px-4 py-5 sm:px-6">
            <h2 className="text-sm font-medium">Request verification</h2>
            <p className="mt-1 text-xs text-muted">
              Include registration proof or other evidence admins can review.
            </p>
            <div className="mt-4">
              <VerificationRequestForm />
            </div>
          </section>
        ) : null}

        {history.length > 0 ? (
          <section className="mt-8">
            <h2 className="text-sm font-medium">Request history</h2>
            <ul className="mt-3 space-y-3">
              {history.map((r) => (
                <li
                  key={r.id}
                  className="rounded-lg border border-border bg-card px-4 py-3 text-sm"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="neutral">{r.status}</Badge>
                    <span className="text-xs text-muted">
                      {new Date(r.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="mt-2 line-clamp-3 text-muted">{r.notes}</p>
                  <p className="mt-1 text-xs text-muted">
                    {r.documents.length} document
                    {r.documents.length === 1 ? "" : "s"}
                  </p>
                  {r.reviewNote ? (
                    <p className="mt-2 text-sm">
                      <span className="font-medium">Review:</span> {r.reviewNote}
                    </p>
                  ) : null}
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <p className="mt-6">
          <Link
            href="/studio"
            className="text-sm font-medium text-primary hover:underline"
          >
            ← Back to posts
          </Link>
        </p>
      </main>
    </>
  );
}
