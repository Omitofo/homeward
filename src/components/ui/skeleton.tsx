import { cn } from "@/lib/utils/cn";

export type SkeletonProps = {
  className?: string;
};

/**
 * Loading placeholder. Pulse animation is disabled when motion is off
 * via the global prefers-reduced-motion / data-motion rules in globals.css.
 */
export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-secondary",
        className,
      )}
      aria-hidden
    />
  );
}
