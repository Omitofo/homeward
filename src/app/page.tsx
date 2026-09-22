import type { Metadata } from "next";
import Link from "next/link";
import { postsRepository } from "@/features/posts";
import { Hero } from "@/features/intro/Hero";
import { StoryBeats } from "@/features/intro/StoryBeats";
import { Stats } from "@/features/intro/Stats";
import { CardPeek } from "@/features/intro/CardPeek";
import { IntroFooter } from "@/features/intro/IntroFooter";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: {
    absolute: `${siteConfig.name} · Find a companion`,
  },
  description: siteConfig.description,
  openGraph: {
    title: `${siteConfig.name} · Find a companion`,
    description: siteConfig.description,
    url: siteConfig.url,
  },
};

export default async function HomePage() {
  const { items } = await postsRepository.list({ limit: 8 });

  // Rough mock aggregates for the stats strip
  const countries = new Set(items.map((p) => p.countryCode)).size;
  const shelterIds = new Set(items.map((p) => p.shelter.id)).size;

  // Prefer a fuller list for counts when available
  const all = await postsRepository.list({ limit: 40 });
  const animalCount = all.items.length + (all.nextCursor ? 10 : 0);
  const countryCount = new Set(all.items.map((p) => p.countryCode)).size || countries;
  const shelterCount = new Set(all.items.map((p) => p.shelter.id)).size || shelterIds;

  const photoUrls = items.slice(0, 3).map((p) => ({
    src: p.media[0]?.url ?? "",
    alt: p.media[0]?.altText ?? p.name,
  }));

  return (
    <div className="min-h-full">
      <header className="absolute inset-x-0 top-0 z-20">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link href="/" className="text-lg font-semibold tracking-tight text-foreground">
            {siteConfig.name}
          </Link>
          <Link
            href="/explore"
            className="text-sm font-medium text-muted hover:text-foreground"
          >
            Explore
          </Link>
        </div>
      </header>

      <main id="main-content">
        <Hero photoUrls={photoUrls} />
        <StoryBeats />
        <Stats
          animals={animalCount}
          shelters={shelterCount}
          countries={countryCount}
        />
        <CardPeek posts={items} />
        <IntroFooter />
      </main>
    </div>
  );
}
