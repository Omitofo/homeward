import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { postsRepository } from "@/features/posts";
import { Avatar, Badge, VerifiedBadge } from "@/components/ui";
import { PostGallery } from "@/features/posts/PostGallery";
import { PostActions } from "@/features/posts/PostActions";
import { getCurrentProfile, IntentResume } from "@/features/auth";
import {
  getLikedByMe,
  getSavedByMe,
  listComments,
  CommentSection,
} from "@/features/engagement";
import { getBlockStateForShelter } from "@/features/chat";
import { AppHeader } from "@/components/layout/AppHeader";
import { siteConfig } from "@/config/site";
import type { AnimalPost } from "@/types/domain";

type Props = {
  params: Promise<{ id: string }>;
};

function statusVariant(status: AnimalPost["status"]) {
  if (status === "available") return "available" as const;
  if (status === "reserved") return "reserved" as const;
  if (status === "adopted") return "adopted" as const;
  return "neutral" as const;
}

function ageLabel(months: number, group: string) {
  if (months < 12) return `${months} months · ${group}`;
  const years = Math.floor(months / 12);
  const rem = months % 12;
  if (rem === 0) return `${years} year${years === 1 ? "" : "s"} · ${group}`;
  return `${years}y ${rem}mo · ${group}`;
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function formatListedDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-GB", {
      month: "short",
      day: "numeric",
      year: "numeric",
      timeZone: "UTC",
    });
  } catch {
    return "";
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const post = await postsRepository.getById(id);
  if (!post) {
    return { title: "Animal not found", robots: { index: false } };
  }

  const title = `${post.name} · ${post.breed}`;
  const description = post.description.slice(0, 160);
  const image = post.media[0];
  const url = `${siteConfig.url}/post/${post.id}`;

  return {
    title,
    description,
    alternates: { canonical: `/post/${post.id}` },
    openGraph: {
      type: "article",
      title,
      description,
      url,
      images: image
        ? [
            {
              url: image.url,
              width: image.width,
              height: image.height,
              alt: image.altText || post.name,
            },
          ]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: image ? [image.url] : undefined,
    },
  };
}

export default async function PostDetailPage({ params }: Props) {
  const { id } = await params;
  const [post, profile] = await Promise.all([
    postsRepository.getById(id),
    getCurrentProfile(),
  ]);

  if (!post) {
    notFound();
  }

  const signedIn = profile !== null;
  const [initialLiked, initialSaved, initialComments, blockState] =
    await Promise.all([
      signedIn ? getLikedByMe(post.id) : Promise.resolve(false),
      signedIn ? getSavedByMe(post.id) : Promise.resolve(false),
      listComments(post.id),
      signedIn
        ? getBlockStateForShelter(post.shelter.id)
        : Promise.resolve({ peerId: null, blockedByMe: false }),
    ]);

  const shareUrl = `${siteConfig.url}/post/${post.id}`;
  const shareTitle = `${post.name} · ${post.breed}`;
  const shareText = post.description.slice(0, 120);

  return (
    <div className="min-h-full">
      <AppHeader
        profile={profile}
        maxWidthClassName="max-w-5xl"
        loginNext={`/post/${post.id}`}
      />

      <main id="main-content" className="mx-auto max-w-5xl px-4 py-6">
        <div className="mb-6">
          <IntentResume signedIn={signedIn} />
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          <div className="lg:sticky lg:top-20 lg:self-start">
            <PostGallery media={post.media} name={post.name} />
          </div>

          <div className="flex flex-col gap-6">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant={statusVariant(post.status)} withDot>
                  {capitalize(post.status)}
                </Badge>
                <span className="text-sm text-muted">
                  {capitalize(post.species)} · {capitalize(post.size)}
                </span>
              </div>

              <h1 className="text-3xl font-semibold tracking-tight text-foreground">
                {post.name}
              </h1>

              <p className="text-muted">
                {post.breed} · {ageLabel(post.ageMonths, post.ageGroup)} ·{" "}
                {capitalize(post.sex)}
              </p>

              <p className="text-sm text-muted">
                {post.city}, {post.region} · {post.countryCode}
              </p>
            </div>

            <div className="space-y-2">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
                About
              </h2>
              <p className="leading-relaxed text-foreground">{post.description}</p>
            </div>

            {post.traits.length > 0 && (
              <div className="space-y-2">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
                  Traits
                </h2>
                <div className="flex flex-wrap gap-2">
                  {post.traits.map((t) => (
                    <span
                      key={t}
                      className="rounded-full border border-border bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground"
                    >
                      {t.replace(/-/g, " ")}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-6 text-sm text-muted">
              <span>{post.likeCount} likes</span>
              <span>{post.commentCount} comments</span>
              <span>Listed {formatListedDate(post.createdAt)}</span>
            </div>

            <PostActions
              postId={post.id}
              status={post.status}
              signedIn={signedIn}
              likeCount={post.likeCount}
              initialLiked={initialLiked}
              initialSaved={initialSaved}
              userId={profile?.id}
              role={profile?.role}
              shelterId={post.shelter.id}
              shelterProfileId={blockState.peerId}
              blockedByMe={blockState.blockedByMe}
              animalName={post.name}
              shareTitle={shareTitle}
              shareUrl={shareUrl}
              shareText={shareText}
            />

            <Link
              href={`/shelter/${post.shelter.handle}`}
              className="group flex items-center gap-3 rounded-lg border border-border bg-card p-4 transition-shadow hover:shadow-md"
            >
              <Avatar
                name={post.shelter.orgName}
                size="md"
                src={post.shelter.avatarUrl}
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-foreground group-hover:underline">
                    {post.shelter.orgName}
                  </span>
                  {post.shelter.verificationStatus === "verified" && (
                    <VerifiedBadge />
                  )}
                </div>
                <p className="text-sm text-muted">
                  {post.shelter.city}, {post.shelter.countryCode}
                </p>
              </div>
              <span className="text-sm text-muted group-hover:text-foreground">
                View →
              </span>
            </Link>

            <div className="border-t border-border pt-6">
              <CommentSection
                postId={post.id}
                initialComments={initialComments}
                initialCount={Math.max(post.commentCount, initialComments.length)}
                signedIn={signedIn}
                userId={profile?.id}
                displayName={profile?.displayName}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
