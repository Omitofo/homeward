import type { Metadata } from "next";
import Link from "next/link";
import { EmptyState, EmptyStateLink } from "@/components/ui";
import { postsRepository } from "@/features/posts";
import {
  requireShelterContext,
  StudioNav,
  StudioPostRow,
} from "@/features/studio";

export const metadata: Metadata = {
  title: "Studio",
  robots: { index: false, follow: false },
};

export default async function StudioPage() {
  const ctx = await requireShelterContext();
  if (!ctx) return null;

  if (!ctx.shelter) {
    return (
      <>
        <StudioNav pathname="/studio" />
        <main id="main-content" className="mx-auto max-w-3xl px-4 py-10">
          <EmptyState
            title="Studio is for rescue accounts"
            description="You are signed in as an adopter. Register a shelter account to post animals and manage your profile."
            action={
              <EmptyStateLink href="/register/shelter">
                Register as shelter
              </EmptyStateLink>
            }
          />
        </main>
      </>
    );
  }

  const { profile, shelter } = ctx;
  const posts = await postsRepository.listByShelter(shelter.id);

  return (
    <>
      <StudioNav pathname="/studio" orgName={shelter.orgName} />
      <main id="main-content" className="mx-auto max-w-3xl px-4 py-8">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Your posts</h1>
            <p className="mt-1 text-sm text-muted">
              Signed in as {profile.displayName} · @{shelter.handle}
            </p>
          </div>
          <Link
            href="/studio/new"
            className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            New post
          </Link>
        </div>

        {posts.length === 0 ? (
          <EmptyState
            title="No animals yet"
            description="Publish your first listing so adopters can find them on Explore."
            action={
              <EmptyStateLink href="/studio/new">Create a post</EmptyStateLink>
            }
          />
        ) : (
          <ul className="space-y-2">
            {posts.map((post) => (
              <StudioPostRow key={post.id} post={post} />
            ))}
          </ul>
        )}

        <p className="mt-10 text-center text-sm text-muted">
          <Link href={`/shelter/${shelter.handle}`} className="hover:underline">
            View public profile
          </Link>
        </p>
      </main>
    </>
  );
}
