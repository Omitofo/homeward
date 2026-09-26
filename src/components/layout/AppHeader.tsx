import Link from "next/link";
import { MessagesNavLink } from "@/features/chat";
import { AdminNavLink } from "@/features/admin";
import { MotionToggle } from "@/motion/components/MotionToggle";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils/cn";
import type { AuthProfile } from "@/features/auth/types";

export type AppHeaderActive = "explore" | "me" | "messages" | "none";

type Props = {
  profile: AuthProfile | null;
  /** Which primary nav item is current (subtle weight, not a heavy chrome). */
  active?: AppHeaderActive;
  maxWidthClassName?: string;
  showMotionToggle?: boolean;
  /** Path for login redirect when signed out. */
  loginNext?: string;
  sticky?: boolean;
  className?: string;
};

const linkBase =
  "text-sm font-medium text-muted transition-colors hover:text-foreground";
const linkActive = "text-sm font-medium text-foreground";

/**
 * Shared top bar for public / account surfaces.
 * Left: Homeward + Explore. Right: role tools (Admin / Studio / Messages / Account).
 */
export function AppHeader({
  profile,
  active = "none",
  maxWidthClassName = "max-w-6xl",
  showMotionToggle = true,
  loginNext = "/explore",
  sticky = true,
  className,
}: Props) {
  const isAdmin = profile?.role === "admin";
  const isShelter = profile?.role === "shelter";

  return (
    <header
      className={cn(
        "z-20 border-b border-border bg-background/95 backdrop-blur",
        sticky && "sticky top-0",
        className,
      )}
    >
      <div
        className={cn(
          "mx-auto flex items-center justify-between gap-3 px-4 py-3 sm:gap-4",
          maxWidthClassName,
        )}
      >
        <div className="flex min-w-0 items-center gap-3 sm:gap-4">
          <Link
            href="/"
            className="truncate text-lg font-semibold tracking-tight text-foreground"
          >
            {siteConfig.name}
          </Link>
          <Link
            href="/explore"
            className={active === "explore" ? linkActive : linkBase}
            aria-current={active === "explore" ? "page" : undefined}
          >
            Explore
          </Link>
        </div>

        <div className="flex shrink-0 items-center gap-2.5 sm:gap-3">
          {isAdmin ? <AdminNavLink /> : null}
          {isShelter ? (
            <Link
              href="/studio"
              className="text-sm font-medium text-primary hover:underline"
            >
              Studio
            </Link>
          ) : null}

          {profile ? (
            <>
              <MessagesNavLink
                className={
                  active === "messages"
                    ? "relative inline-flex items-center text-sm font-medium text-foreground"
                    : undefined
                }
              />
              <Link
                href="/me"
                className={cn(
                  active === "me" ? linkActive : linkBase,
                  "max-w-[8rem] truncate sm:max-w-none",
                )}
                aria-current={active === "me" ? "page" : undefined}
              >
                {profile.displayName}
              </Link>
            </>
          ) : (
            <Link
              href={`/login?next=${encodeURIComponent(loginNext)}`}
              className={linkBase}
            >
              Sign in
            </Link>
          )}

          {showMotionToggle ? <MotionToggle /> : null}
        </div>
      </div>
    </header>
  );
}
