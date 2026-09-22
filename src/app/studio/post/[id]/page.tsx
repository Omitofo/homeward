import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge, EmptyState } from "@/components/ui";
import { postsRepository } from "@/features/posts";
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

  const post = await postsRepository.getById(id);
  if (!post || post.shelter.id !== ctx.shelter.id) {
    notFound();
  }

  return (
    <>
      <StudioNav pathname="/studio" orgName={ctx.shelter.orgName} />
      <main className="mx-auto max-w-3xl px-4 py-8">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-semibold tracking-tight">{post.name}</h1>
          <Badge
            variant={
              post.status === "available"
                ? "available"
                : post.status === "reserved"
                  ? "reserved"
                  : post.status === "adopted"
                    ? "adopted"
                    : "neutral"
            }
            withDot
          >
            {post.status}
          </Badge>
        </div>
        <p className="text-sm text-muted">
          Edit form (status, details, images) lands with the composer in P5-02.
        </p>

        <dl className="mt-8 space-y-3 rounded-lg border border-border bg-card p-5 text-sm">
          <div>
            <dt className="text-muted">Species / breed</dt>
            <dd className="font-medium">
              {post.species} · {post.breed || "mixed"}
            </dd>
          </div>
          <div>
            <dt className="text-muted">Location</dt>
            <dd className="font-medium">
              {[post.city, post.region, post.countryCode]
                .filter(Boolean)
                .join(", ")}
            </dd>
          </div>
          <div>
            <dt className="text-muted">Description</dt>
            <dd className="mt-0.5 whitespace-pre-wrap">{post.description}</dd>
          </div>
        </dl>

        <p className="mt-6 flex flex-wrap gap-4 text-sm">
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
