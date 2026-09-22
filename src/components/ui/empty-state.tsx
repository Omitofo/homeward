import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export type EmptyStateProps = {
  title: string;
  description?: string;
  /** Primary action — prefer a Link or Button */
  action?: ReactNode;
  className?: string;
};

/**
 * Quiet empty / zero-results block used across feed, profile, and errors.
 */
export function EmptyState({
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "rounded-lg border border-border bg-card px-6 py-16 text-center",
        className,
      )}
      role="status"
    >
      <h2 className="text-lg font-medium text-foreground">{title}</h2>
      {description && (
        <p className="mx-auto mt-1 max-w-sm text-sm text-muted">{description}</p>
      )}
      {action && <div className="mt-6 flex justify-center">{action}</div>}
    </div>
  );
}

export function EmptyStateLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
    >
      {children}
    </Link>
  );
}
