import Link from "next/link";
import { SignOutButton } from "@/features/auth";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils/cn";

const links = [
  { href: "/studio", label: "Posts", exact: true },
  { href: "/studio/new", label: "New post" },
  { href: "/studio/profile", label: "Profile" },
  { href: "/studio/verification", label: "Verification" },
] as const;

export function StudioNav({
  pathname,
  orgName,
}: {
  pathname: string;
  orgName?: string;
}) {
  return (
    <header className="border-b border-border bg-card">
      <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <div className="flex min-w-0 items-center gap-3">
          <Link
            href="/"
            className="text-sm font-semibold tracking-tight hover:underline"
          >
            {siteConfig.name}
          </Link>
          <span className="text-muted" aria-hidden>
            /
          </span>
          <span className="text-sm font-medium">Studio</span>
          {orgName && (
            <span className="hidden truncate text-sm text-muted sm:inline">
              · {orgName}
            </span>
          )}
        </div>
        <SignOutButton />
      </div>
      <nav
        className="mx-auto flex max-w-3xl gap-1 overflow-x-auto px-4 pb-3"
        aria-label="Studio sections"
      >
        {links.map((link) => {
          const active = link.exact
            ? pathname === link.href
            : pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                // min 44px touch height on mobile
                "inline-flex min-h-11 items-center rounded-md px-3 text-sm font-medium transition-colors",
                active
                  ? "bg-secondary text-foreground"
                  : "text-muted hover:bg-secondary/60 hover:text-foreground",
              )}
              aria-current={active ? "page" : undefined}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
