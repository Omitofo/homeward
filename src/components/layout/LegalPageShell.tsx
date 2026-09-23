import Link from "next/link";
import type { ReactNode } from "react";
import { siteConfig } from "@/config/site";
import { SiteFooter } from "./SiteFooter";

type Props = {
  title: string;
  updated: string;
  children: ReactNode;
};

export function LegalPageShell({ title, updated, children }: Props) {
  return (
    <div className="flex min-h-full flex-col">
      <header className="border-b border-border px-4 py-4">
        <div className="mx-auto flex max-w-2xl items-center justify-between">
          <Link href="/" className="text-lg font-semibold tracking-tight">
            {siteConfig.name}
          </Link>
          <Link
            href="/explore"
            className="text-sm font-medium text-muted hover:text-foreground"
          >
            Explore
          </Link>
        </div>
      </header>

      <main id="main-content" className="mx-auto w-full max-w-2xl flex-1 px-4 py-12">
        <p className="text-xs font-medium uppercase tracking-wide text-muted">
          Last updated {updated}
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">{title}</h1>
        <div className="prose-legal mt-8 space-y-5 text-sm leading-relaxed text-foreground/90">
          {children}
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
