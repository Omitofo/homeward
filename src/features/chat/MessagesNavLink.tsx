import Link from "next/link";
import { cn } from "@/lib/utils/cn";
import { getUnreadMessageCount } from "./actions";

type Props = {
  className?: string;
  /** Optional pre-fetched count to avoid a second query */
  count?: number;
};

/**
 * “Messages” link with a top-right unread badge when count > 0.
 * Safe to render only for signed-in users.
 */
export async function MessagesNavLink({ className, count: countProp }: Props) {
  const count =
    typeof countProp === "number" ? countProp : await getUnreadMessageCount();
  const label = count > 99 ? "99+" : String(count);

  return (
    <Link
      href="/messages"
      className={cn(
        "relative inline-flex items-center text-sm font-medium text-muted hover:text-foreground",
        className,
      )}
      aria-label={
        count > 0
          ? `Messages, ${count} unread`
          : "Messages"
      }
    >
      Messages
      {count > 0 ? (
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
