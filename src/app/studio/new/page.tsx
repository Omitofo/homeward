import type { Metadata } from "next";
import Link from "next/link";
import { EmptyState } from "@/components/ui";
import { requireShelterContext, StudioNav } from "@/features/studio";

export const metadata: Metadata = {
  title: "New post · Studio",
  robots: { index: false, follow: false },
};

export default async function StudioNewPage() {
  const ctx = await requireShelterContext();
  if (!ctx) return null;

  if (!ctx.shelter) {
    return (
      <>
        <StudioNav pathname="/studio/new" />
        <main className="mx-auto max-w-3xl px-4 py-10">
          <EmptyState
            title="Studio is for rescue accounts"
            description="Register as a shelter to create posts."
          />
        </main>
      </>
    );
  }

  return (
    <>
      <StudioNav pathname="/studio/new" orgName={ctx.shelter.orgName} />
      <main className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="text-2xl font-semibold tracking-tight">New post</h1>
        <p className="mt-1 text-sm text-muted">
          Composer lands in P5-02 (images + animal details). This route is the
          placeholder so navigation and guards are already in place.
        </p>

        <div className="mt-8 rounded-lg border border-dashed border-border bg-card px-6 py-12 text-center">
          <p className="text-sm text-muted">
            Upload pipeline (P5-01) and composer form (P5-02) come next.
          </p>
          <Link
            href="/studio"
            className="mt-4 inline-block text-sm font-medium text-primary hover:underline"
          >
            ← Back to posts
          </Link>
        </div>
      </main>
    </>
  );
}
