import { cn } from "@/lib/utils/cn";

export type BadgeVariant =
  | "verified"
  | "available"
  | "reserved"
  | "adopted"
  | "neutral"
  | "pending"
  | "rejected"
  | "needs_info"
  | "warning"
  | "info";

const variantClasses: Record<BadgeVariant, string> = {
  verified: "bg-verified/15 text-verified-foreground",
  available: "bg-status-available/15 text-status-available",
  reserved: "bg-status-reserved/15 text-status-reserved",
  adopted: "bg-status-adopted/15 text-status-adopted",
  neutral: "bg-secondary text-muted",
  pending: "bg-warning/15 text-warning",
  rejected: "bg-danger/15 text-danger",
  needs_info: "bg-info/15 text-info",
  warning: "bg-warning/15 text-warning",
  info: "bg-info/15 text-info",
};

const dotClasses: Record<BadgeVariant, string> = {
  verified: "bg-verified",
  available: "bg-status-available",
  reserved: "bg-status-reserved",
  adopted: "bg-status-adopted",
  neutral: "bg-muted",
  pending: "bg-warning",
  rejected: "bg-danger",
  needs_info: "bg-info",
  warning: "bg-warning",
  info: "bg-info",
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
          className={cn("h-1.5 w-1.5 shrink-0 rounded-full", dotClasses[variant])}
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

const SHELTER_STATUS_LABEL: Record<string, string> = {
  unverified: "Unverified",
  pending: "Pending review",
  verified: "Verified",
  rejected: "Not approved",
};

const SHELTER_STATUS_VARIANT: Record<string, BadgeVariant> = {
  unverified: "neutral",
  pending: "pending",
  verified: "verified",
  rejected: "rejected",
};

/** Shelter profile verification_status chip */
export function ShelterVerificationBadge({
  status,
  className,
}: {
  status: string;
  className?: string;
}) {
  if (status === "verified") {
    return <VerifiedBadge className={className} />;
  }
  const variant = SHELTER_STATUS_VARIANT[status] ?? "neutral";
  const label = SHELTER_STATUS_LABEL[status] ?? status;
  return (
    <Badge variant={variant} withDot className={className}>
      {label}
    </Badge>
  );
}

const REQUEST_STATUS_LABEL: Record<string, string> = {
  pending: "Pending",
  needs_info: "Needs info",
  approved: "Approved",
  rejected: "Rejected",
};

const REQUEST_STATUS_VARIANT: Record<string, BadgeVariant> = {
  pending: "pending",
  needs_info: "needs_info",
  approved: "available",
  rejected: "rejected",
};

/** verification_requests.status chip */
export function VerificationRequestBadge({
  status,
  className,
}: {
  status: string;
  className?: string;
}) {
  const variant = REQUEST_STATUS_VARIANT[status] ?? "neutral";
  const label = REQUEST_STATUS_LABEL[status] ?? status;
  return (
    <Badge variant={variant} withDot className={className}>
      {label}
    </Badge>
  );
}
