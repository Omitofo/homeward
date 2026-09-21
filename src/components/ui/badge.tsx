import { cn } from "@/lib/utils/cn";

export type BadgeVariant = "verified" | "available" | "reserved" | "adopted" | "neutral";

const variantClasses: Record<BadgeVariant, string> = {
  verified: "bg-verified/15 text-verified-foreground",
  available: "bg-status-available/15 text-status-available",
  reserved: "bg-status-reserved/15 text-status-reserved",
  adopted: "bg-status-adopted/15 text-status-adopted",
  neutral: "bg-secondary text-muted",
};

export type BadgeProps = {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
  /** Show a small dot before the label (Verified style) */
  withDot?: boolean;
};

export function Badge({
  variant = "neutral",
  children,
  className,
  withDot = false,
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium",
        variantClasses[variant],
        className,
      )}
    >
      {withDot && (
        <span
          className={cn(
            "h-1.5 w-1.5 shrink-0 rounded-full",
            variant === "verified" && "bg-verified",
            variant === "available" && "bg-status-available",
            variant === "reserved" && "bg-status-reserved",
            variant === "adopted" && "bg-status-adopted",
            variant === "neutral" && "bg-muted",
          )}
          aria-hidden
        />
      )}
      {children}
    </span>
  );
}

/** Convenience wrapper for the Verified rescue badge */
export function VerifiedBadge({ className }: { className?: string }) {
  return (
    <Badge variant="verified" withDot className={className}>
      Verified
    </Badge>
  );
}
