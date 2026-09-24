import Link from "next/link";
import { Badge } from "@/components/ui";
import type { AnimalPost, PostStatus } from "@/types/domain";

const statusVariant: Record<
  PostStatus,
  "available" | "reserved" | "adopted" | "neutral"
> = {
  available: "available",
  reserved: "reserved",
  adopted: "adopted",
  archived: "neutral",
};

export function StudioPostRow({ post }: { post: AnimalPost }) {
  const thumb = post.media[0];
  const href = `/studio/post/${post.id}`;

  return (
    <li className="flex items-center gap-3 rounded-lg border border-border bg-card p-3">
      <div className="h-14 w-14 shrink-0 overflow-hidden rounded-md bg-secondary">
        {thumb ? (
          // eslint-disable-next-line @next/next/no-img-element -- mock URLs vary; Image later with storage
          <img
            src={thumb.url}
            alt=""
            className="h-full w-full object-cover"
            width={56}
            height={56}
          />
        ) : null}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={href}
            className="truncate font-medium hover:underline"
          >
            {post.name}
            <span className="sr-only"> — edit post</span>
          </Link>
          <Badge variant={statusVariant[post.status]} withDot>
            {post.status}
          </Badge>
        </div>
        <p className="mt-0.5 truncate text-sm text-muted">
          {post.species} · {post.breed || "mixed"} · {post.city}
        </p>
        <p className="mt-1 flex flex-wrap gap-3 text-xs text-muted" aria-label="Engagement">
          <span title="Likes">♥ {post.likeCount}</span>
          <span title="Comments">{post.commentCount} comments</span>
        </p>
      </div>
      <Link
        href={href}
        className="inline-flex min-h-11 shrink-0 items-center text-sm font-medium text-primary hover:underline"
        aria-label={`Edit ${post.name}`}
      >
        Edit
      </Link>
    </li>
  );
}
