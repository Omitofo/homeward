import Image from "next/image";
import Link from "next/link";
import type { AnimalPost } from "@/types/domain";

/** Compact thumbnail linking to the post — for /me lists, not full feed cards. */
export function SavedAnimalThumb({ post }: { post: AnimalPost }) {
  const media = post.media[0];

  return (
    <Link
      href={`/post/${post.id}`}
      className="group block overflow-hidden rounded-md border border-border bg-card transition-opacity hover:opacity-90"
    >
      <div className="relative aspect-square bg-secondary">
        {media ? (
          <Image
            src={media.url}
            alt={media.altText || post.name}
            fill
            sizes="(max-width: 640px) 33vw, 120px"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-[10px] text-muted">
            No photo
          </div>
        )}
      </div>
      <div className="px-1.5 py-1">
        <p className="truncate text-xs font-medium leading-tight text-foreground">
          {post.name}
        </p>
        <p className="truncate text-[10px] leading-tight text-muted">
          {post.city}
        </p>
      </div>
    </Link>
  );
}
