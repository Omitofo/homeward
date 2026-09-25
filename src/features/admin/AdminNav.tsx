"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignOutButton } from "@/features/auth/components/SignOutButton";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils/cn";
import type { AdminQueueCounts } from "./types";

type AdminLink = {
  href: string;
  label: string;
  exact?: boolean;
  countKey?: keyof Pick<
    AdminQueueCounts,
    "applications" | "verification" | "reports"
  >;
};

const links: AdminLink[] = [
  { href: "/admin", label: "Overview", exact: true },
  {
    href: "/admin/shelter-applications",
    label: "Applications",
    countKey: "applications",
  },
  {
    href: "/admin/verification",
    label: "Verification",
    countKey: "verification",
  },
  { href: "/admin/reports", label: "Reports", countKey: "reports" },
];

function CountBadge({ count }: { count: number }) {
  if (count <= 0) return null;
  const label = count > 99 ? "99+" : String(count);
  return (
    <span
      className="ml-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold leading-none text-primary-foreground"
      aria-hidden
    >
      {label}
    </span>
  );
}

export function AdminNav({
  displayName,
  counts,
}: {
  displayName?: string;
  counts?: AdminQueueCounts;
}) {
  const pathname = usePathname() ?? "/admin";
  const c = counts ?? {
    applications: 0,
    verification: 0,
    reports: 0,
    total: 0,
  };

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
          <Link
            href="/admin"
            className="relative inline-flex items-center text-sm font-medium hover:underline"
            aria-label={
              c.total > 0 ? `Admin, ${c.total} pending` : "Admin"
            }
          >
            Admin
            <CountBadge count={c.total} />
          </Link>
          {displayName ? (
            <span className="hidden truncate text-sm text-muted sm:inline">
              · {displayName}
            </span>
          ) : null}
        </div>
        <div className="flex items-center gap-3">
          <Link href="/me" className="text-sm text-muted hover:text-foreground">
            Account
          </Link>
          <SignOutButton />
        </div>
      </div>
      <nav
        className="mx-auto flex max-w-3xl gap-1 overflow-x-auto px-4 pb-3"
        aria-label="Admin sections"
      >
        {links.map((link) => {
          const active = link.exact
            ? pathname === link.href
            : pathname.startsWith(link.href);
          const count = link.countKey ? c[link.countKey] : 0;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "inline-flex min-h-11 items-center rounded-md px-3 text-sm font-medium transition-colors",
                active
                  ? "bg-secondary text-foreground"
                  : "text-muted hover:bg-secondary/60 hover:text-foreground",
              )}
              aria-current={active ? "page" : undefined}
              aria-label={
                count > 0 ? `${link.label}, ${count} pending` : link.label
              }
            >
              {link.label}
              <CountBadge count={count} />
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
