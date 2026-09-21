"use client";

import { useLayoutEffect, useRef } from "react";
import type { AnimalPost } from "@/types/domain";
import { PostCard } from "./PostCard";
import { gsap, Flip } from "@/motion/register";
import { duration, ease, stagger, distance } from "@/motion/tokens";
import { useMotionPreference } from "@/motion/hooks/useMotionPreference";

/** Max cards to stagger at once (mobile perf). Rest appear instantly after. */
const STAGGER_CAP = 12;

export function FeedGrid({ posts }: { posts: AnimalPost[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const prevIdsRef = useRef<string[]>([]);
  const { level } = useMotionPreference();

  useLayoutEffect(() => {
    const root = containerRef.current;
    if (!root) return;

    const cards = Array.from(
      root.querySelectorAll<HTMLElement>("[data-feed-card]"),
    );
    const ids = posts.map((p) => p.id);
    const prev = prevIdsRef.current;

    // Detect append (infinite scroll) vs full replace (filter / first paint)
    const isAppend =
      prev.length > 0 &&
      ids.length > prev.length &&
      prev.every((id, i) => ids[i] === id);

    const run = () => {
      if (level === "off") {
        gsap.set(cards, { autoAlpha: 1, y: 0, clearProps: "transform" });
        prevIdsRef.current = ids;
        return;
      }

      if (isAppend) {
        const newCards = cards.slice(prev.length);
        if (newCards.length === 0) {
          prevIdsRef.current = ids;
          return;
        }

        if (level === "reduced") {
          gsap.fromTo(
            newCards,
            { autoAlpha: 0 },
            {
              autoAlpha: 1,
              duration: duration.instant,
              stagger: stagger.tight,
              ease: ease.out,
              overwrite: true,
            },
          );
        } else {
          gsap.fromTo(
            newCards,
            { autoAlpha: 0, y: distance.sm },
            {
              autoAlpha: 1,
              y: 0,
              duration: duration.fast,
              stagger: stagger.tight,
              ease: ease.out,
              overwrite: true,
            },
          );
        }
        prevIdsRef.current = ids;
        return;
      }

      // Full replace / first paint — optional Flip when some cards persist
      const prevSet = new Set(prev);
      const hasOverlap = ids.some((id) => prevSet.has(id)) && prev.length > 0;

      if (hasOverlap && level === "full" && prev.length > 0) {
        // Capture was not taken pre-commit; use a soft crossfade + stagger instead
        // of a broken Flip (React already swapped the DOM).
        // Still set data-flip-id so shared-element transitions can use Flip later.
      }

      const toAnimate = cards.slice(0, STAGGER_CAP);
      const rest = cards.slice(STAGGER_CAP);

      if (rest.length) gsap.set(rest, { autoAlpha: 1, y: 0 });

      if (level === "reduced") {
        gsap.fromTo(
          toAnimate,
          { autoAlpha: 0 },
          {
            autoAlpha: 1,
            duration: duration.instant,
            stagger: stagger.tight,
            ease: ease.out,
            overwrite: true,
          },
        );
      } else {
        gsap.fromTo(
          toAnimate,
          { autoAlpha: 0, y: distance.md },
          {
            autoAlpha: 1,
            y: 0,
            duration: duration.base,
            stagger: stagger.base,
            ease: ease.out,
            overwrite: true,
          },
        );
      }

      prevIdsRef.current = ids;
    };

    run();

    // Cleanup: kill tweens on unmount / before next run
    return () => {
      gsap.killTweensOf(cards);
    };
  }, [posts, level]);

  if (posts.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card px-6 py-16 text-center">
        <p className="text-lg font-medium text-foreground">No animals match</p>
        <p className="mt-1 text-sm text-muted">Try clearing some filters.</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
    >
      {posts.map((post) => (
        <div
          key={post.id}
          data-feed-card
          data-flip-id={post.id}
          // Hidden until GSAP sets autoAlpha (avoids FOUC when motion is on).
          // Off level is handled in the effect with an immediate set.
          style={level === "off" ? undefined : { opacity: 0 }}
        >
          <PostCard post={post} />
        </div>
      ))}
    </div>
  );
}

// Keep Flip imported so the plugin stays registered for future shared-element work.
void Flip;
