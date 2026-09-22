import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentProfile, SignOutButton } from "@/features/auth";
import {
  listSavedSearches,
  SavedSearchesList,
} from "@/features/engagement";
import { siteConfig } from "@/config/site";

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
    <main id="main-content" className="mx-auto max-w-lg px-4 py-12">
      <div className="mb-8 flex items-center justify-between">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          {siteConfig.name}
        </Link>
        <SignOutButton />
      </div>

      <h1 className="text-2xl font-semibold tracking-tight">Your account</h1>
      <p className="mt-1 text-sm text-muted">
        Manage your profile and saved searches.
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

      <p className="mt-8">
        <Link href="/explore" className="text-sm font-medium text-primary hover:underline">
          ← Back to explore
        </Link>
      </p>
    </main>
  );
}
