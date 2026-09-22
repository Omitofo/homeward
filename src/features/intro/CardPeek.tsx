import Image from "next/image";
import Link from "next/link";
import type { AnimalPost } from "@/types/domain";
import { Reveal } from "@/motion/primitives/Reveal";

export function CardPeek({ posts }: { posts: AnimalPost[] }) {
  return (
    <section className="border-t border-border px-4 py-20">
      <div className="mx-auto max-w-6xl space-y-8">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">Looking for a home</h2>
              <p className="mt-1 text-sm text-muted">A peek at who’s waiting right now.</p>
            </div>
            <Link
              href="/explore"
              className="text-sm font-medium text-primary hover:underline"
            >
              See all →
            </Link>
          </div>
        </Reveal>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
          {posts.slice(0, 4).map((post, i) => {
            const img = post.media[0];
            return (
              <Reveal key={post.id} delay={i * 0.05}>
                <Link
                  href={`/post/${post.id}`}
                  className="group block overflow-hidden rounded-lg border border-border bg-card shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="relative aspect-square overflow-hidden bg-secondary">
                    {img && (
                      <Image
                        src={img.url}
                        alt={img.altText || post.name}
                        fill
                        sizes="(max-width: 640px) 50vw, 25vw"
                        className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                      />
                    )}
                  </div>
                  <div className="p-2.5">
                    <p className="truncate font-medium text-foreground">{post.name}</p>
                    <p className="truncate text-xs text-muted">
                      {post.breed} · {post.city}
                    </p>
                  </div>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
