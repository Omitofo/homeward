"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignOutButton } from "@/features/auth/components/SignOutButton";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils/cn";

type AdminLink = {
  href: string;
  label: string;
  exact?: boolean;
};

const links: AdminLink[] = [
  { href: "/admin", label: "Overview", exact: true },
  { href: "/admin/shelter-applications", label: "Applications" },
  { href: "/admin/verification", label: "Verification" },
  { href: "/admin/reports", label: "Reports" },
];

export function AdminNav({ displayName }: { displayName?: string }) {
  const pathname = usePathname() ?? "/admin";

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
          <Link href="/admin" className="text-sm font-medium hover:underline">
            Admin
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
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
