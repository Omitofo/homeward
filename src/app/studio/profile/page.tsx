import type { Metadata } from "next";
import Link from "next/link";
import { EmptyState } from "@/components/ui";
import { ProfileEditor } from "@/features/shelters/profile";
import { requireShelterContext, StudioNav } from "@/features/studio";

export const metadata: Metadata = {
  title: "Profile · Studio",
  robots: { index: false, follow: false },
};

export default async function StudioProfilePage() {
  const ctx = await requireShelterContext();
  if (!ctx) return null;

  if (!ctx.shelter) {
    return (
      <>
        <StudioNav pathname="/studio/profile" />
        <main id="main-content" className="mx-auto max-w-3xl px-4 py-10">
          <EmptyState
            title="Studio is for rescue accounts"
            description="Register as a shelter to edit a public profile."
          />
        </main>
      </>
    );
  }

  const { shelter } = ctx;

  return (
    <>
      <StudioNav pathname="/studio/profile" orgName={shelter.orgName} />
      <main id="main-content" className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="text-2xl font-semibold tracking-tight">Shelter profile</h1>
        <p className="mt-1 text-sm text-muted">
          Public details adopters see on{" "}
          <Link
            href={`/shelter/${shelter.handle}`}
            className="font-medium text-primary hover:underline"
          >
            /shelter/{shelter.handle}
          </Link>
          .
        </p>

        <div className="mt-8">
          <ProfileEditor shelter={shelter} />
        </div>
      </main>
    </>
  );
}
