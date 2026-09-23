import Link from "next/link";
import { siteConfig } from "@/config/site";

const links = [
  { href: "/about", label: "About" },
  { href: "/safety", label: "Safety" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
] as const;

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border px-4 py-10">
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-4 text-center sm:flex-row sm:justify-between sm:text-left">
        <p className="text-xs text-muted">
          © {new Date().getFullYear()} {siteConfig.name}. Adopt with care.
        </p>
        <nav aria-label="Legal and trust" className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-xs font-medium text-muted underline-offset-4 hover:text-foreground hover:underline"
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
