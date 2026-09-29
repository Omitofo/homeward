"use client";

import { useCallback, useId, useState } from "react";
import Image from "next/image";
import type { PostMedia } from "@/types/domain";
import { cn } from "@/lib/utils/cn";
import { ChevronLeft, ChevronRight } from "@/components/icons";

type Props = {
  media: PostMedia[];
  name: string;
  /** next/image sizes attribute for the main photo */
  sizes?: string;
};

export function CardCarousel({
  media,
  name,
  sizes = "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw",
}: Props) {
  const sorted = [...media].sort((a, b) => a.position - b.position);
  const [index, setIndex] = useState(0);
  const count = sorted.length;
  const statusId = useId();

  const go = useCallback(
    (delta: number, e?: React.MouseEvent | React.KeyboardEvent) => {
      e?.preventDefault();
      e?.stopPropagation();
      if (count <= 1) return;
      setIndex((i) => (i + delta + count) % count);
    },
    [count],
  );

  const jump = useCallback(
    (i: number, e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIndex(i);
    },
    [],
  );

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (count <= 1) return;
      if (e.key === "ArrowLeft") go(-1, e);
      if (e.key === "ArrowRight") go(1, e);
    },
    [count, go],
  );

  if (count === 0) {
    return (
      <div className="flex h-full items-center justify-center text-muted">No photo</div>
    );
  }

  const current = sorted[index]!;

  return (
    <div
      className="relative h-full w-full"
      role="group"
      aria-roledescription="carousel"
      aria-label={name + " photos"}
      onKeyDown={onKeyDown}
    >
      <Image
        src={current.url}
        alt={current.altText || (name + " photo " + (index + 1))}
        fill
        sizes={sizes}
        className="object-cover object-center"
      />

      {/* Live region announces slide changes for screen readers */}
      <span id={statusId} className="sr-only" aria-live="polite" aria-atomic="true">
        Photo {index + 1} of {count}
      </span>

      {count > 1 && (
        <>
          <button
            type="button"
            onClick={(e) => go(-1, e)}
            className="absolute left-1.5 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-background/80 text-foreground shadow-sm backdrop-blur opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100 focus-visible:opacity-100"
            aria-label="Previous photo"
            aria-controls={statusId}
          >
            <ChevronLeft size={16} />
          </button>
          <button
            type="button"
            onClick={(e) => go(1, e)}
            className="absolute right-1.5 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-background/80 text-foreground shadow-sm backdrop-blur opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100 focus-visible:opacity-100"
            aria-label="Next photo"
            aria-controls={statusId}
          >
            <ChevronRight size={16} />
          </button>

          <div className="absolute bottom-2 left-1/2 z-10 flex -translate-x-1/2 gap-1.5" role="tablist" aria-label="Photo pagination">
            {sorted.map((_, i) => (
              <button
                key={sorted[i]!.id}
                type="button"
                onClick={(e) => jump(i, e)}
                className={cn(
                  "h-2 min-w-2 rounded-full transition-all",
                  i === index ? "w-3.5 bg-primary" : "w-2 bg-background/80",
                )}
                aria-label={"Photo " + (i + 1) + " of " + count}
                aria-current={i === index ? "true" : undefined}
              />
            ))}
          </div>

          <span className="absolute right-2 top-2 z-10 rounded-full bg-background/80 px-1.5 py-0.5 text-[10px] font-medium text-foreground backdrop-blur" aria-hidden>
            {index + 1}/{count}
          </span>
        </>
      )}
    </div>
  );
}
