import type { Metadata } from "next";
import Link from "next/link";
import { postsRepository } from "@/features/posts";
import { parseFeedFilters, toDomainFilters } from "@/features/filters/schema";
import { FilterBar } from "@/features/filters/FilterBar";
import { FeedInfinite } from "@/features/feed/FeedInfinite";
import { MotionToggle } from "@/motion/components/MotionToggle";
import { getCurrentProfile } from "@/features/auth";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Explore",
  description: "Browse animals looking for a home from verified rescue centers.",
  openGraph: {
    title: `Explore · ${siteConfig.name}`,
    description: "Browse animals looking for a home from verified rescue centers.",
    url: `${siteConfig.url}/explore`,
  },
  alternates: {
    canonical: "/explore",
  },
};

const PAGE_SIZE = 12;

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ExplorePage({ searchParams }: Props) {
  const params = await searchParams;
  const parsed = parseFeedFilters(params);
  const domainFilters = toDomainFilters(parsed);

  const [{ items, nextCursor }, profile] = await Promise.all([
    postsRepository.list({
      filters: domainFilters,
      limit: PAGE_SIZE,
    }),
    getCurrentProfile(),
  ]);

  const hasFilters =
    Boolean(parsed.species?.length) ||
    Boolean(parsed.size?.length) ||
    Boolean(parsed.ageGroup?.length) ||
    Boolean(parsed.sex?.length) ||
    Boolean(parsed.verified) ||
    Boolean(parsed.q) ||
    Boolean(parsed.country);

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
          <div className="flex items-center gap-3">
            {profile ? (
              <Link
                href="/me"
                className="text-sm font-medium text-muted hover:text-foreground"
              >
                {profile.displayName}
              </Link>
            ) : (
              <Link
                href="/login?next=/explore"
                className="text-sm font-medium text-muted hover:text-foreground"
              >
                Sign in
              </Link>
            )}
            <MotionToggle />
          </div>
        </div>
      </header>

      <main id="main-content" className="mx-auto max-w-6xl px-4 py-6">
        <div className="mb-6 space-y-4">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">Find a companion</h1>
              <p className="mt-1 text-sm text-muted">
                {items.length}
                {nextCursor ? "+" : ""} animal{items.length === 1 && !nextCursor ? "" : "s"}
                {" shown"}
                {hasFilters ? " · filtered" : ""}
              </p>
            </div>
          </div>
          <FilterBar
            filters={parsed}
            signedIn={profile !== null}
            userId={profile?.id}
            canSaveSearch={profile?.role !== "shelter"}
          />
        </div>

        <FeedInfinite
          initialItems={items}
          initialCursor={nextCursor}
          filters={domainFilters}
          pageSize={PAGE_SIZE}
        />
      </main>
    </div>
  );
}
