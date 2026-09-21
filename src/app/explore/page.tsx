import type { Metadata } from "next";
import Link from "next/link";
import { postsRepository } from "@/features/posts";
import { parseFeedFilters, toDomainFilters } from "@/features/filters/schema";
import { FilterChips } from "@/features/filters/FilterChips";
import { FeedGrid } from "@/features/feed/FeedGrid";
import { MotionToggle } from "@/motion/components/MotionToggle";

export const metadata: Metadata = {
  title: "Explore",
  description: "Browse animals looking for a home.",
};

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ExplorePage({ searchParams }: Props) {
  const params = await searchParams;
  const parsed = parseFeedFilters(params);
  const domainFilters = toDomainFilters(parsed);

  const { items } = await postsRepository.list({
    filters: domainFilters,
    limit: 24,
  });

  return (
    <div className="min-h-full">
      <header className="sticky top-0 z-20 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-lg font-semibold tracking-tight text-foreground">
              Homeward
            </Link>
            <span className="hidden text-sm text-muted sm:inline">Explore</span>
          </div>
          <MotionToggle />
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">
        <div className="mb-6 space-y-4">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">Find a companion</h1>
              <p className="mt-1 text-sm text-muted">
                {items.length} animal{items.length === 1 ? "" : "s"} shown
                {parsed.species?.length || parsed.verified ? " · filtered" : ""}
              </p>
            </div>
          </div>
          <FilterChips filters={parsed} />
        </div>

        <FeedGrid posts={items} />
      </main>
    </div>
  );
}
