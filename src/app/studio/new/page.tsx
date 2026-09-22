import type { Metadata } from "next";
import Link from "next/link";
import { EmptyState } from "@/components/ui";
import { requireShelterContext, StudioNav } from "@/features/studio";
import { ImageUploadSmoke } from "@/features/posts/upload/ImageUploadSmoke";

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
          Image upload pipeline (P5-01). Full animal form lands in P5-02.
        </p>

        <section className="mt-8 rounded-lg border border-border bg-card px-4 py-6 sm:px-6">
          <h2 className="text-sm font-medium">Photos</h2>
          <p className="mt-1 text-xs text-muted">
            Try one image — validated by magic bytes, re-encoded to WebP with
            EXIF stripped, stored under your shelter path.
          </p>
          <div className="mt-4">
            <ImageUploadSmoke />
          </div>
        </section>

        <p className="mt-6 text-sm">
          <Link
            href="/studio"
            className="font-medium text-primary hover:underline"
          >
            ← Back to posts
          </Link>
        </p>
      </main>
    </>
  );
}
