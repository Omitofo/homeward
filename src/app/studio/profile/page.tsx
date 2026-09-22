import type { Metadata } from "next";
import Link from "next/link";
import { Badge, EmptyState, VerifiedBadge } from "@/components/ui";
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
        <main className="mx-auto max-w-3xl px-4 py-10">
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
      <main className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="text-2xl font-semibold tracking-tight">Shelter profile</h1>
        <p className="mt-1 text-sm text-muted">
          Public details adopters see on{" "}
          <Link
            href={`/shelter/${shelter.handle}`}
            className="font-medium text-primary hover:underline"
          >
            /shelter/{shelter.handle}
          </Link>
          . Full editor lands in P5-03.
        </p>

        <dl className="mt-8 space-y-4 rounded-lg border border-border bg-card p-5 text-sm">
          <div>
            <dt className="text-muted">Organization</dt>
            <dd className="mt-0.5 flex flex-wrap items-center gap-2 font-medium">
              {shelter.orgName}
              {shelter.verificationStatus === "verified" ? (
                <VerifiedBadge />
              ) : (
                <Badge variant="neutral">{shelter.verificationStatus}</Badge>
              )}
            </dd>
          </div>
          <div>
            <dt className="text-muted">Handle</dt>
            <dd className="mt-0.5 font-medium">@{shelter.handle}</dd>
          </div>
          <div>
            <dt className="text-muted">Location</dt>
            <dd className="mt-0.5 font-medium">
              {[shelter.city, shelter.region, shelter.countryCode]
                .filter(Boolean)
                .join(", ")}
            </dd>
          </div>
          <div>
            <dt className="text-muted">Bio</dt>
            <dd className="mt-0.5 whitespace-pre-wrap">
              {shelter.bio || "—"}
            </dd>
          </div>
          {shelter.links.length > 0 && (
            <div>
              <dt className="text-muted">Links</dt>
              <dd className="mt-0.5 space-y-1">
                {shelter.links.map((link) => (
                  <div key={link.url}>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer nofollow ugc"
                      className="font-medium text-primary hover:underline"
                    >
                      {link.label}
                    </a>
                  </div>
                ))}
              </dd>
            </div>
          )}
        </dl>

        <p className="mt-6 text-sm text-muted">
          Edit form (bio, links, avatar) is P5-03.
        </p>
      </main>
    </>
  );
}
