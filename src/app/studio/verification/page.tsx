import type { Metadata } from "next";
import Link from "next/link";
import { Badge, EmptyState, VerifiedBadge } from "@/components/ui";
import { requireShelterContext, StudioNav } from "@/features/studio";

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
        <main className="mx-auto max-w-3xl px-4 py-10">
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

  return (
    <>
      <StudioNav pathname="/studio/verification" orgName={shelter.orgName} />
      <main className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="text-2xl font-semibold tracking-tight">Verification</h1>
        <p className="mt-1 text-sm text-muted">
          The Verified badge is granted by Homeward admins after reviewing your
          rescue. Request flow is P5-04.
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
              You can request verification once the document upload pipeline is
              ready. Until then, your public profile stays labeled neutrally.
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
              A previous request was not approved. You will be able to re-apply
              with updated documents in a later task.
            </p>
          )}
        </div>

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
