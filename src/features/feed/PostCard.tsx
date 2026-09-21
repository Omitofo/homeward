import Image from "next/image";
import Link from "next/link";
import type { AnimalPost } from "@/types/domain";
import { Avatar, Badge, VerifiedBadge } from "@/components/ui";

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

export function PostCard({ post }: { post: AnimalPost }) {
  const cover = post.media[0];

  return (
    <article className="flex flex-col overflow-hidden rounded-lg border border-border bg-card shadow-sm transition-shadow hover:shadow-md">
      {/* Media */}
      <Link href={`/post/${post.id}`} className="relative block aspect-square overflow-hidden bg-secondary">
        {cover ? (
          <Image
            src={cover.url}
            alt={cover.altText}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted">No photo</div>
        )}
        <div className="absolute left-2 top-2">
          <Badge variant={statusVariant(post.status)} withDot>
            {post.status.charAt(0).toUpperCase() + post.status.slice(1)}
          </Badge>
        </div>
      </Link>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-2 p-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <Link href={`/post/${post.id}`} className="font-semibold text-foreground hover:underline">
              {post.name}
            </Link>
            <p className="text-sm text-muted">
              {post.breed} · {ageLabel(post.ageMonths, post.ageGroup)}
            </p>
          </div>
        </div>

        <p className="line-clamp-2 text-sm text-muted">{post.description}</p>

        {/* Shelter row */}
        <div className="mt-auto flex items-center gap-2 border-t border-border pt-2">
          <Avatar name={post.shelter.orgName} size="sm" src={post.shelter.avatarUrl} />
          <div className="min-w-0 flex-1">
            <Link
              href={`/shelter/${post.shelter.handle}`}
              className="truncate text-sm font-medium text-foreground hover:underline"
            >
              {post.shelter.orgName}
            </Link>
            <p className="truncate text-xs text-muted">
              {post.city}, {post.countryCode}
            </p>
          </div>
          {post.shelter.verificationStatus === "verified" && <VerifiedBadge />}
        </div>

        {/* Meta */}
        <div className="flex items-center gap-3 text-xs text-muted">
          <span>{post.likeCount} likes</span>
          <span>{post.commentCount} comments</span>
        </div>
      </div>
    </article>
  );
}
