import Link from "next/link";
import Image from "next/image";
import type { ChatPostCard } from "./schema";

type Props = {
  post: ChatPostCard;
  /** Align with outgoing (mine) or incoming bubble */
  align?: "start" | "end";
};

function statusLabel(status: string) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

export function AnimalChatCard({ post, align = "end" }: Props) {
  return (
    <Link
      href={`/post/${post.id}`}
      className={
        align === "end"
          ? "ml-8 self-end block w-full max-w-[min(100%,280px)]"
          : "mr-8 self-start block w-full max-w-[min(100%,280px)]"
      }
    >
      <article className="flex overflow-hidden rounded-lg border border-border bg-card shadow-sm transition-shadow hover:shadow-md">
        <div className="relative h-20 w-20 shrink-0 bg-secondary">
          {post.imageUrl ? (
            <Image
              src={post.imageUrl}
              alt={post.imageAlt || post.name}
              fill
              className="object-cover"
              sizes="80px"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs text-muted">
              No photo
            </div>
          )}
        </div>
        <div className="flex min-w-0 flex-1 flex-col justify-center gap-0.5 px-3 py-2">
          <p className="truncate text-sm font-semibold text-foreground">
            {post.name}
          </p>
          <p className="truncate text-xs text-muted">{post.breed}</p>
          <p className="text-[11px] font-medium text-primary">
            {statusLabel(post.status)} · View post →
          </p>
        </div>
      </article>
    </Link>
  );
}
