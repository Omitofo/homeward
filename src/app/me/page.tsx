import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentProfile, SignOutButton } from "@/features/auth";
import { AccountPrivacy } from "@/features/auth/AccountPrivacy";
import {
  listSavedSearches,
  SavedSearchesList,
  listSavedAnimals,
  SavedAnimalsGrid,
} from "@/features/engagement";
import { postsRepository } from "@/features/posts";
import {
  getMyShelterApplication,
  ShelterApplicationStatusCard,
} from "@/features/shelter-applications";
import { AppHeader } from "@/components/layout/AppHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";

export const metadata: Metadata = {
  title: "Your account",
  robots: { index: false, follow: false },
};

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function MePage({ searchParams }: Props) {
  const profile = await getCurrentProfile();
  if (!profile) {
    redirect("/login?next=/me");
  }

  const params = await searchParams;
  const appliedRaw = params.applied;
  const justAppliedShelter =
    appliedRaw === "shelter" ||
    (Array.isArray(appliedRaw) && appliedRaw.includes("shelter"));

  const isAdmin = profile.role === "admin";
  const isShelter = profile.role === "shelter" || isAdmin;

  const [saved, savedAnimals, mockPage, shelterApplication] = await Promise.all([
    listSavedSearches(),
    isShelter ? Promise.resolve([]) : listSavedAnimals(),
    postsRepository.list({ limit: 48 }),
    isShelter ? Promise.resolve(null) : getMyShelterApplication(),
  ]);

  const mockCandidates = mockPage.items;

  return (
    <div className="flex min-h-full flex-col">
      <AppHeader
        profile={profile}
        active="me"
        maxWidthClassName="max-w-2xl"
        loginNext="/me"
      />

      <main id="main-content" className="mx-auto w-full max-w-2xl flex-1 px-4 py-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Your account</h1>
            <p className="mt-1 text-sm text-muted">
              Manage your profile, saved animals, searches, and data.
            </p>
          </div>
          <SignOutButton />
        </div>

        <dl className="mt-2 space-y-4 rounded-lg border border-border bg-card p-5 text-sm">
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
            <dd className="mt-0.5 flex flex-wrap items-center gap-2 font-medium capitalize">
              <span>{profile.role}</span>
              {shelterApplication?.status === "pending" ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-status-reserved/15 px-2.5 py-0.5 text-xs font-medium normal-case text-status-reserved">
                  <span className="h-1.5 w-1.5 rounded-full bg-status-reserved" aria-hidden />
                  Shelter pending
                </span>
              ) : null}
            </dd>
          </div>
        </dl>

        {shelterApplication ? (
          <ShelterApplicationStatusCard
            application={shelterApplication}
            justApplied={justAppliedShelter}
          />
        ) : null}

        {isAdmin ? (
          <p className="mt-6">
            <Link
              href="/admin"
              className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              Open admin command center
            </Link>
          </p>
        ) : null}

        {isShelter && !isAdmin ? (
          <p className="mt-6">
            <Link
              href="/studio"
              className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              Open Studio
            </Link>
          </p>
        ) : null}

        {!isShelter ? (
          <>
            <section className="mt-10 space-y-3">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
                Saved animals
              </h2>
              <SavedAnimalsGrid
                initial={savedAnimals}
                userId={profile.id}
                mockCandidates={mockCandidates}
              />
            </section>

            <section className="mt-10 space-y-3">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
                Saved searches
              </h2>
              <SavedSearchesList initial={saved} userId={profile.id} />
            </section>

            {!shelterApplication ? (
              <p className="mt-8 text-sm text-muted">
                Represent a rescue?{" "}
                <Link
                  href="/register/shelter"
                  className="font-medium text-primary hover:underline"
                >
                  Request shelter access
                </Link>
              </p>
            ) : null}
          </>
        ) : (
          <section className="mt-10 space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
              Adopter tools
            </h2>
            <p className="text-sm text-muted">
              Saved animals and searches are for adopter accounts.
              {isAdmin
                ? " Use the command center for moderation queues."
                : (
                    <>
                      {" "}
                      See like and comment counts on each post in{" "}
                      <Link
                        href="/studio"
                        className="font-medium text-primary hover:underline"
                      >
                        Studio
                      </Link>
                      .
                    </>
                  )}
            </p>
          </section>
        )}

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
      </main>
      <SiteFooter />
    </div>
  );
}
