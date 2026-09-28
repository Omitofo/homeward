import Link from "next/link";
import type { AnimalPost } from "@/types/domain";
import { Avatar, Badge, VerifiedBadge } from "@/components/ui";
import { CardCarousel } from "./CardCarousel";

function statusVariant(status: AnimalPost["status"]) {
  if (status === "available") return "available" as const;
  if (status === "reserved") return "reserved" as const;
  if (status === "adopted") return "adopted" as const;
  return "neutral" as const;
}

function ageLabel(months: number, group: string) {
  if (months < 12) return `${months} mo · ${group}`;
  const years = Math.floor(months / 12);
  return `${years}y · ${group}`;
}

/** Explore card — original equal-height grid layout. */
export function PostCard({ post }: { post: AnimalPost }) {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-lg border border-border bg-card shadow-sm transition-shadow hover:shadow-md">
      <Link
        href={`/post/${post.id}`}
        className="relative block aspect-square shrink-0 overflow-hidden bg-secondary"
      >
        <CardCarousel media={post.media} name={post.name} />
        <div className="absolute left-2 top-2 z-10">
          <Badge variant={statusVariant(post.status)} withDot>
            {post.status.charAt(0).toUpperCase() + post.status.slice(1)}
          </Badge>
        </div>
      </Link>

      <div className="flex min-h-0 flex-1 flex-col gap-2 p-3">
        <div className="min-w-0">
          <Link
            href={`/post/${post.id}`}
            className="block truncate font-semibold text-foreground hover:underline"
          >
            {post.name}
          </Link>
          <p className="truncate text-sm text-muted">
            {post.breed} · {ageLabel(post.ageMonths, post.ageGroup)}
          </p>
        </div>

        <p className="line-clamp-2 min-h-[2.5rem] text-sm text-muted">
          {post.description}
        </p>

        <div className="mt-auto flex items-center gap-2 border-t border-border pt-2">
          <Avatar
            name={post.shelter.orgName}
            size="sm"
            src={post.shelter.avatarUrl}
          />
          <div className="min-w-0 flex-1">
            <Link
              href={`/shelter/${post.shelter.handle}`}
              className="block truncate text-sm font-medium text-foreground hover:underline"
            >
              {post.shelter.orgName}
            </Link>
            <p className="truncate text-xs text-muted">
              {post.city}, {post.countryCode}
            </p>
          </div>
          {post.shelter.verificationStatus === "verified" && <VerifiedBadge />}
        </div>

        <div className="flex items-center gap-3 text-xs text-muted">
          <span>{post.likeCount} likes</span>
          <span>{post.commentCount} comments</span>
        </div>
      </div>
    </article>
  );
}
