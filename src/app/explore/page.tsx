import type { Metadata } from "next";
import { postsRepository } from "@/features/posts";
import { parseFeedFilters, toDomainFilters } from "@/features/filters/schema";
import { FilterBar } from "@/features/filters/FilterBar";
import { FeedInfinite } from "@/features/feed/FeedInfinite";
import { getCurrentProfile } from "@/features/auth";
import { AppHeader } from "@/components/layout/AppHeader";
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
      <AppHeader profile={profile} active="explore" loginNext="/explore" />

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
            canSaveSearch={profile?.role !== "shelter" && profile?.role !== "admin"}
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
