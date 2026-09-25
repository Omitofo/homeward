import Link from "next/link";
import { cn } from "@/lib/utils/cn";
import { getAdminQueueCounts } from "./queue-counts";

type Props = {
  className?: string;
};

/**
 * “Admin” header link with a badge for total pending queue items.
 * Only meaningful for admin sessions (returns zeros otherwise).
 */
export async function AdminNavLink({ className }: Props) {
  const counts = await getAdminQueueCounts();
  const label = counts.total > 99 ? "99+" : String(counts.total);

  return (
    <Link
      href="/admin"
      className={cn(
        "relative inline-flex items-center text-sm font-medium text-primary hover:underline",
        className,
      )}
      aria-label={
        counts.total > 0
          ? `Admin, ${counts.total} pending`
          : "Admin"
      }
    >
      Admin
      {counts.total > 0 ? (
        <span
          className="absolute -right-2.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold leading-none text-primary-foreground"
          aria-hidden
        >
          {label}
        </span>
      ) : null}
    </Link>
  );
}
