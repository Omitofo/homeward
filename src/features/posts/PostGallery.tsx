"use client";

import { useCallback, useEffect, useId, useState } from "react";
import Image from "next/image";
import type { PostMedia } from "@/types/domain";
import { cn } from "@/lib/utils/cn";
import { ChevronLeft, ChevronRight } from "@/components/icons";

type Props = {
  media: PostMedia[];
  name: string;
};

export function PostGallery({ media, name }: Props) {
  const sorted = [...media].sort((a, b) => a.position - b.position);
  const [index, setIndex] = useState(0);
  const count = sorted.length;
  const statusId = useId();

  const go = useCallback(
    (delta: number) => {
      if (count <= 1) return;
      setIndex((i) => (i + delta + count) % count);
    },
    [count],
  );

  useEffect(() => {
    if (count <= 1) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") go(-1);
      if (e.key === "ArrowRight") go(1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, count]);

  if (count === 0) {
    return (
      <div className="flex aspect-square items-center justify-center rounded-lg bg-secondary text-muted lg:aspect-auto lg:h-full">
        No photo
      </div>
    );
  }

  const current = sorted[index]!;

  return (
    <div
      className="space-y-3 lg:flex lg:h-full lg:min-h-0 lg:flex-col lg:gap-2 lg:space-y-0 lg:p-3"
      role="group"
      aria-roledescription="carousel"
      aria-label={`${name} photos`}
    >
      {/*
        Mobile: square aspect.
        Desktop: fill remaining left-column height (parent is flex + min-h-0).
      */}
      <div className="relative aspect-square overflow-hidden rounded-lg bg-secondary lg:aspect-auto lg:min-h-0 lg:flex-1 lg:rounded-xl">
        <Image
          src={current.url}
          alt={current.altText || `${name} photo ${index + 1}`}
          fill
          sizes="(max-width: 1024px) 100vw, 40vw"
          className="object-cover"
          priority={index === 0}
        />

        <span id={statusId} className="sr-only" aria-live="polite" aria-atomic="true">
          Photo {index + 1} of {count}
        </span>

        {count > 1 && (
          <>
            <button
              type="button"
              onClick={() => go(-1)}
              className="absolute left-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-background/80 text-foreground shadow-sm backdrop-blur hover:bg-background"
              aria-label="Previous photo"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              className="absolute right-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-background/80 text-foreground shadow-sm backdrop-blur hover:bg-background"
              aria-label="Next photo"
            >
              <ChevronRight size={20} />
            </button>
          </>
        )}

        {count > 1 && (
          <div
            className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5"
            role="tablist"
            aria-label="Photo pagination"
          >
            {sorted.map((_, i) => (
              <button
                key={sorted[i]!.id}
                type="button"
                onClick={() => setIndex(i)}
                className={cn(
                  "h-2.5 min-w-2.5 rounded-full transition-all",
                  i === index ? "w-4 bg-primary" : "w-2.5 bg-background/70",
                )}
                aria-label={`Photo ${i + 1} of ${count}`}
                aria-current={i === index ? "true" : undefined}
              />
            ))}
          </div>
        )}
      </div>

      {count > 1 && (
        <div
          className="flex gap-2 overflow-x-auto pb-1 lg:shrink-0 lg:pb-0"
          role="list"
        >
          {sorted.map((m, i) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setIndex(i)}
              className={cn(
                "relative h-14 w-14 shrink-0 overflow-hidden rounded-md border-2 transition-opacity sm:h-16 sm:w-16",
                i === index
                  ? "border-primary opacity-100"
                  : "border-transparent opacity-70 hover:opacity-100",
              )}
              aria-label={`${m.altText || `${name} photo ${i + 1}`} (${i + 1} of ${count})`}
              aria-current={i === index ? "true" : undefined}
            >
              <Image
                src={m.url}
                alt=""
                fill
                sizes="64px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
