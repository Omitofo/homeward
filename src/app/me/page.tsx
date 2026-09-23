import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentProfile, SignOutButton } from "@/features/auth";
import { AccountPrivacy } from "@/features/auth/AccountPrivacy";
import {
  listSavedSearches,
  SavedSearchesList,
} from "@/features/engagement";
import { siteConfig } from "@/config/site";
import { SiteFooter } from "@/components/layout/SiteFooter";

export const metadata: Metadata = {
  title: "Your account",
  robots: { index: false, follow: false },
};

export default async function MePage() {
  const profile = await getCurrentProfile();
  if (!profile) {
    redirect("/login?next=/me");
  }

  const saved = await listSavedSearches();

  return (
    <div className="flex min-h-full flex-col">
      <main id="main-content" className="mx-auto w-full max-w-lg flex-1 px-4 py-12">
        <div className="mb-8 flex items-center justify-between">
          <Link href="/" className="text-lg font-semibold tracking-tight">
            {siteConfig.name}
          </Link>
          <SignOutButton />
        </div>

        <h1 className="text-2xl font-semibold tracking-tight">Your account</h1>
        <p className="mt-1 text-sm text-muted">
          Manage your profile, saved searches, and data.
        </p>

        <dl className="mt-8 space-y-4 rounded-lg border border-border bg-card p-5 text-sm">
          <div>
            <dt className="text-muted">Name</dt>
            <dd className="mt-0.5 font-medium">{profile.displayName}</dd>
          </div>
          <div>
            <dt className="text-muted">Email</dt>
            <dd className="mt-0.5 font-medium">{profile.email ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-muted">Role</dt>
            <dd className="mt-0.5 font-medium capitalize">{profile.role}</dd>
          </div>
        </dl>

        <section className="mt-10 space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
            Saved searches
          </h2>
          <SavedSearchesList initial={saved} userId={profile.id} />
        </section>

        <AccountPrivacy />

        <p className="mt-8 text-sm text-muted">
          <Link href="/privacy" className="font-medium text-primary hover:underline">
            Privacy policy
          </Link>
          {" · "}
          <Link href="/terms" className="font-medium text-primary hover:underline">
            Terms
          </Link>
        </p>

        <p className="mt-6">
          <Link href="/explore" className="text-sm font-medium text-primary hover:underline">
            ← Back to explore
          </Link>
        </p>
      </main>
      <SiteFooter />
    </div>
  );
}
