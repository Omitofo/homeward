import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EmptyState } from "@/components/ui";
import { postsRepository } from "@/features/posts";
import { PostComposer } from "@/features/posts/composer";
import { getMockCreatedById } from "@/features/posts/composer/mock-store";
import { requireShelterContext, StudioNav } from "@/features/studio";

export const metadata: Metadata = {
  title: "Edit post · Studio",
  robots: { index: false, follow: false },
};

type Props = { params: Promise<{ id: string }> };

export default async function StudioEditPostPage({ params }: Props) {
  const { id } = await params;
  const ctx = await requireShelterContext();
  if (!ctx) return null;

  if (!ctx.shelter) {
    return (
      <>
        <StudioNav pathname="/studio" />
        <main className="mx-auto max-w-3xl px-4 py-10">
          <EmptyState
            title="Studio is for rescue accounts"
            description="Only the owning shelter can edit a post."
          />
        </main>
      </>
    );
  }

  // Prefer in-session mock creates, then repository (seeded mock / Supabase)
  const post =
    getMockCreatedById(id) ?? (await postsRepository.getById(id));

  if (!post || post.shelter.id !== ctx.shelter.id) {
    notFound();
  }

  return (
    <>
      <StudioNav pathname="/studio" orgName={ctx.shelter.orgName} />
      <main className="mx-auto max-w-3xl px-4 py-8">
        <div className="mb-1 flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-semibold tracking-tight">Edit post</h1>
        </div>
        <p className="text-sm text-muted">
          Update details, photos, or status for {post.name}.
        </p>

        <div className="mt-8">
          <PostComposer mode="edit" initial={post} />
        </div>

        <p className="mt-8 flex flex-wrap gap-4 text-sm">
          <Link href="/studio" className="font-medium text-primary hover:underline">
            ← Back to posts
          </Link>
          <Link
            href={`/post/${post.id}`}
            className="font-medium text-primary hover:underline"
          >
            View public post
          </Link>
        </p>
      </main>
    </>
  );
}
