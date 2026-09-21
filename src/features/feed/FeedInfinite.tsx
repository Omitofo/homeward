"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import type { AnimalPost, FeedFilters } from "@/types/domain";
import { FeedGrid } from "./FeedGrid";
import { loadMorePosts } from "./actions";
import { Skeleton } from "@/components/ui";

type Props = {
  initialItems: AnimalPost[];
  initialCursor: string | null;
  filters: FeedFilters;
  pageSize?: number;
};

export function FeedInfinite({
  initialItems,
  initialCursor,
  filters,
  pageSize = 12,
}: Props) {
  const [items, setItems] = useState(initialItems);
  const [cursor, setCursor] = useState(initialCursor);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const loadingRef = useRef(false);

  // Reset when server re-renders with new filters / first page
  useEffect(() => {
    setItems(initialItems);
    setCursor(initialCursor);
    setError(null);
  }, [initialItems, initialCursor]);

  const loadMore = useCallback(() => {
    if (!cursor || loadingRef.current) return;
    loadingRef.current = true;
    setError(null);

    startTransition(async () => {
      try {
        const result = await loadMorePosts({
          filters,
          cursor,
          limit: pageSize,
        });
        setItems((prev) => {
          const seen = new Set(prev.map((p) => p.id));
          const fresh = result.items.filter((p) => !seen.has(p.id));
          return [...prev, ...fresh];
        });
        setCursor(result.nextCursor);
      } catch {
        setError("Couldn’t load more. Try again.");
      } finally {
        loadingRef.current = false;
      }
    });
  }, [cursor, filters, pageSize]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !cursor) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) loadMore();
      },
      { rootMargin: "240px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [cursor, loadMore]);

  return (
    <div className="space-y-6">
      <FeedGrid posts={items} />

      {cursor && (
        <div ref={sentinelRef} className="flex flex-col items-center gap-3 py-4">
          {isPending && (
            <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="overflow-hidden rounded-lg border border-border">
                  <Skeleton className="aspect-square w-full rounded-none" />
                  <div className="space-y-2 p-3">
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-3 w-1/2" />
                    <Skeleton className="h-3 w-full" />
                  </div>
                </div>
              ))}
            </div>
          )}
          {error && (
            <button
              type="button"
              onClick={loadMore}
              className="text-sm font-medium text-primary hover:underline"
            >
              {error}
            </button>
          )}
          {!isPending && !error && (
            <p className="text-xs text-muted">Scroll for more</p>
          )}
        </div>
      )}

      {!cursor && items.length > 0 && (
        <p className="py-6 text-center text-sm text-muted">You’ve seen all matches</p>
      )}
    </div>
  );
}
