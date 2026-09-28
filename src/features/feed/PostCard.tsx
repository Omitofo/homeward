import Link from "next/link";
import type { AnimalPost } from "@/types/domain";
import { Avatar, Badge, VerifiedBadge } from "@/components/ui";
import { Heart } from "@/components/icons";
import { CardCarousel } from "./CardCarousel";

function statusVariant(status: AnimalPost["status"]) {
  if (status === "available") return "available" as const;
  if (status === "reserved") return "reserved" as const;
  if (status === "adopted") return "adopted" as const;
  return "neutral" as const;
}

function ageLabel(months: number, group: string) {
  if (months < 12) return `${months} mo`;
  const years = Math.floor(months / 12);
  return `${years}y`;
}

/**
 * Explore card — photo-first (Airbnb), calm type (Apple), light meta.
 */
export function PostCard({ post }: { post: AnimalPost }) {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl bg-card transition-transform duration-200 hover:-translate-y-0.5">
      <Link
        href={`/post/${post.id}`}
        className="relative block aspect-[4/5] shrink-0 overflow-hidden rounded-2xl bg-secondary shadow-sm ring-1 ring-black/5"
      >
        <CardCarousel media={post.media} name={post.name} />
        <div className="absolute left-2.5 top-2.5 z-10">
          <Badge variant={statusVariant(post.status)} withDot>
            {post.status.charAt(0).toUpperCase() + post.status.slice(1)}
          </Badge>
        </div>
        {post.likeCount > 0 ? (
          <div className="absolute bottom-2.5 right-2.5 z-10 flex items-center gap-1 rounded-full bg-black/45 px-2 py-1 text-xs font-medium text-white backdrop-blur-sm">
            <Heart size={12} className="text-white" />
            <span className="tabular-nums">{post.likeCount}</span>
          </div>
        ) : null}
      </Link>

      <div className="flex min-h-0 flex-1 flex-col gap-1.5 px-1 pt-3">
        <div className="min-w-0">
          <Link
            href={`/post/${post.id}`}
            className="block truncate text-[15px] font-semibold tracking-tight text-foreground"
          >
            {post.name}
          </Link>
          <p className="truncate text-sm text-muted">
            {post.breed}
            <span className="mx-1 text-border">·</span>
            {ageLabel(post.ageMonths, post.ageGroup)}
            <span className="mx-1 text-border">·</span>
            {post.city}
          </p>
        </div>

        <div className="mt-auto flex items-center gap-2 pt-1">
          <Avatar
            name={post.shelter.orgName}
            size="sm"
            src={post.shelter.avatarUrl}
          />
          <Link
            href={`/shelter/${post.shelter.handle}`}
            className="min-w-0 flex-1 truncate text-xs font-medium text-muted hover:text-foreground"
          >
            {post.shelter.orgName}
          </Link>
          {post.shelter.verificationStatus === "verified" && (
            <VerifiedBadge />
          )}
        </div>
      </div>
    </article>
  );
}
