import type { Metadata } from "next";
import Link from "next/link";
import { EmptyState } from "@/components/ui";
import { requireAdminContext } from "@/features/admin";

export const metadata: Metadata = {
  title: "Admin · Command center",
  robots: { index: false, follow: false },
};

const sections = [
  {
    href: "/admin/shelter-applications",
    title: "Shelter applications",
    description:
      "Review request-to-join applications. Approving creates the shelter account and unlocks Studio.",
  },
  {
    href: "/admin/verification",
    title: "Verification queue",
    description:
      "Grant or revoke the public Verified badge after reviewing documentation.",
  },
  {
    href: "/admin/reports",
    title: "Reports",
    description:
      "Dismiss noise, hide abusive comments, or archive posts reported by users.",
  },
] as const;

export default async function AdminHomePage() {
  const ctx = await requireAdminContext();
  if (!ctx) {
    return (
      <main id="main-content" className="mx-auto max-w-3xl px-4 py-10">
        <EmptyState
          title="Admins only"
          description="This area is restricted to Homeward administrators."
        />
        <p className="mt-6 text-center text-sm">
          <Link href="/" className="font-medium text-primary hover:underline">
            ← Home
          </Link>
        </p>
      </main>
    );
  }

  return (
    <main id="main-content" className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-semibold tracking-tight">Command center</h1>
      <p className="mt-1 text-sm text-muted">
        Moderation and shelter onboarding tools. Signed in as{" "}
        {ctx.profile.displayName}.
      </p>

      <ul className="mt-8 grid gap-4 sm:grid-cols-1">
        {sections.map((s) => (
          <li key={s.href}>
            <Link
              href={s.href}
              className="block rounded-lg border border-border bg-card p-5 transition-colors hover:border-primary/40 hover:bg-secondary/30"
            >
              <h2 className="text-base font-semibold">{s.title}</h2>
              <p className="mt-1 text-sm text-muted">{s.description}</p>
              <span className="mt-3 inline-block text-sm font-medium text-primary">
                Open →
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <p className="mt-10 text-sm">
        <Link href="/explore" className="font-medium text-primary hover:underline">
          ← Explore
        </Link>
      </p>
    </main>
  );
}
