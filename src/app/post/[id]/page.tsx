import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { postsRepository } from "@/features/posts";
import { Avatar, Badge, VerifiedBadge } from "@/components/ui";
import { PostGallery } from "@/features/posts/PostGallery";
import { PostActions } from "@/features/posts/PostActions";
import { LockPostScroll } from "@/features/posts/LockPostScroll";
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
    /*
      Mobile: natural document scroll.
      Desktop: shell fills the viewport; html/body overflow locked via
      LockPostScroll. Only the right column scrolls inside the card.
    */
    <div className="flex min-h-full flex-col lg:h-dvh lg:max-h-dvh lg:overflow-hidden">
      <LockPostScroll />
      <AppHeader
        profile={profile}
        maxWidthClassName="max-w-3xl"
        loginNext={`/post/${post.id}`}
        sticky={false}
        className="shrink-0"
      />

      <main
        id="main-content"
        className="mx-auto flex w-full max-w-3xl min-h-0 flex-1 flex-col overflow-hidden px-3 py-2"
      >
        <div className="mb-1.5 shrink-0">
          <IntentResume signedIn={signedIn} />
        </div>

        <div
          className={
            "grid min-h-0 flex-1 grid-rows-1 gap-0 overflow-hidden rounded-lg border border-border bg-card shadow-sm " +
            "lg:grid-cols-2"
          }
        >
          <div className="min-h-0 overflow-hidden bg-secondary lg:border-r lg:border-border">
            <PostGallery media={post.media} name={post.name} />
          </div>

          <div className="sheet-scroll flex min-h-0 flex-col gap-3 overflow-y-auto overscroll-contain p-3 sm:p-4">
            <Link
              href={`/shelter/${post.shelter.handle}`}
              className="flex items-center gap-2"
            >
              <Avatar
                name={post.shelter.orgName}
                size="sm"
                src={post.shelter.avatarUrl}
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1">
                  <span className="truncate text-xs font-semibold">
                    {post.shelter.orgName}
                  </span>
                  {post.shelter.verificationStatus === "verified" && (
                    <VerifiedBadge />
                  )}
                </div>
                <p className="truncate text-[11px] text-muted">
                  {post.shelter.city}, {post.shelter.countryCode}
                </p>
              </div>
            </Link>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-1.5">
                <Badge variant={statusVariant(post.status)} withDot>
                  {capitalize(post.status)}
                </Badge>
                <span className="text-[11px] text-muted">
                  {capitalize(post.species)} · {capitalize(post.size)}
                </span>
              </div>

              <h1 className="text-lg font-semibold tracking-tight text-foreground sm:text-xl">
                {post.name}
              </h1>

              <p className="text-xs text-muted">
                {post.breed} · {ageLabel(post.ageMonths, post.ageGroup)} ·{" "}
                {capitalize(post.sex)}
              </p>
              <p className="text-xs text-muted">
                {post.city}, {post.region} · {post.countryCode}
              </p>
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

            <div className="space-y-1.5 border-t border-border pt-2.5">
              <p className="text-sm leading-relaxed text-foreground">
                <span className="font-semibold">{post.name}</span>{" "}
                {post.description}
              </p>
              {post.traits.length > 0 ? (
                <div className="flex flex-wrap gap-1 pt-0.5">
                  {post.traits.map((t) => (
                    <span
                      key={t}
                      className="rounded-full bg-secondary px-2 py-0.5 text-[11px] font-medium text-secondary-foreground"
                    >
                      {t.replace(/-/g, " ")}
                    </span>
                  ))}
                </div>
              ) : null}
              <p className="text-[11px] text-muted">
                Listed {formatListedDate(post.createdAt)} · {post.commentCount}{" "}
                comments
              </p>
            </div>

            <div className="border-t border-border pt-2.5 pb-1">
              <CommentSection
                postId={post.id}
                initialComments={initialComments}
                initialCount={Math.max(
                  post.commentCount,
                  initialComments.length,
                )}
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
