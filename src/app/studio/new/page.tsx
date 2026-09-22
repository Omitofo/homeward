import type { Metadata } from "next";
import Link from "next/link";
import { EmptyState } from "@/components/ui";
import { PostComposer } from "@/features/posts/composer";
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
          Add photos and details. Adopters will see this on Explore.
        </p>

        <div className="mt-8">
          <PostComposer
            mode="create"
            defaults={{
              countryCode: ctx.shelter.countryCode,
              region: ctx.shelter.region,
              city: ctx.shelter.city,
            }}
          />
        </div>

        <p className="mt-8 text-sm">
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
