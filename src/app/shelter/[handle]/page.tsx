import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { sheltersRepository } from "@/features/shelters";
import { postsRepository } from "@/features/posts";
import { Avatar, Badge, VerifiedBadge } from "@/components/ui";
import { FeedGrid } from "@/features/feed/FeedGrid";
import { getCurrentProfile } from "@/features/auth";
import { StartChatButton } from "@/features/chat";
import { AppHeader } from "@/components/layout/AppHeader";
import { siteConfig } from "@/config/site";
import type { VerificationStatus } from "@/types/domain";

type Props = {
  params: Promise<{ handle: string }>;
};

function verificationLabel(status: VerificationStatus) {
  if (status === "verified") return null;
  if (status === "pending") return "Pending verification";
  if (status === "rejected") return "Not verified";
  return "Unverified";
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { handle } = await params;
  const shelter = await sheltersRepository.getByHandle(handle);
  if (!shelter) {
    return { title: "Shelter not found", robots: { index: false } };
  }

  const title = shelter.orgName;
  const description = shelter.bio.slice(0, 160);
  const url = `${siteConfig.url}/shelter/${shelter.handle}`;

  return {
    title,
    description,
    alternates: { canonical: `/shelter/${shelter.handle}` },
    openGraph: {
      type: "profile",
      title,
      description,
      url,
      images: shelter.avatarUrl
        ? [{ url: shelter.avatarUrl, alt: shelter.orgName }]
        : undefined,
    },
    twitter: {
      card: "summary",
      title,
      description,
      images: shelter.avatarUrl ? [shelter.avatarUrl] : undefined,
    },
  };
}

export default async function ShelterProfilePage({ params }: Props) {
  const { handle } = await params;
  const [shelter, profile] = await Promise.all([
    sheltersRepository.getByHandle(handle),
    getCurrentProfile(),
  ]);

  if (!shelter) {
    notFound();
  }

  const animals = await postsRepository.listByShelter(shelter.id);
  const availableCount = animals.filter((a) => a.status === "available").length;
  const signedIn = profile !== null;
  const canMessage = profile?.role !== "shelter";

  return (
    <div className="min-h-full">
      <AppHeader
        profile={profile}
        maxWidthClassName="max-w-5xl"
        loginNext={`/shelter/${shelter.handle}`}
      />

      <main id="main-content" className="mx-auto max-w-5xl px-4 py-8">
        <section className="mb-10 flex flex-col gap-6 sm:flex-row sm:items-start">
          <Avatar
            name={shelter.orgName}
            size="xl"
            src={shelter.avatarUrl}
            className="mx-auto sm:mx-0"
          />

          <div className="flex-1 space-y-4 text-center sm:text-left">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                  {shelter.orgName}
                </h1>
                {shelter.verificationStatus === "verified" ? (
                  <VerifiedBadge />
                ) : (
                  <Badge variant="neutral">
                    {verificationLabel(shelter.verificationStatus)}
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted">@{shelter.handle}</p>
              <p className="text-sm text-muted">
                {shelter.city}, {shelter.region} · {shelter.countryCode}
              </p>
            </div>

            <p className="mx-auto max-w-xl leading-relaxed text-foreground sm:mx-0">
              {shelter.bio}
            </p>

            <div className="flex flex-wrap justify-center gap-6 text-sm sm:justify-start">
              <div>
                <span className="font-semibold text-foreground">{animals.length}</span>{" "}
                <span className="text-muted">listed</span>
              </div>
              <div>
                <span className="font-semibold text-foreground">{availableCount}</span>{" "}
                <span className="text-muted">available</span>
              </div>
              <div>
                <span className="font-semibold text-foreground">{shelter.animalCount}</span>{" "}
                <span className="text-muted">in care</span>
              </div>
            </div>

            {shelter.links.length > 0 && (
              <div className="flex flex-wrap justify-center gap-2 sm:justify-start">
                {shelter.links.map((link) => (
                  <a
                    key={link.url}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer nofollow ugc"
                    className="inline-flex h-9 items-center rounded-md border border-border bg-secondary px-3 text-sm font-medium text-secondary-foreground hover:bg-accent"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            )}

            <div className="flex justify-center sm:justify-start">
              {canMessage ? (
                <StartChatButton
                  shelterId={shelter.id}
                  signedIn={signedIn}
                  label="Message"
                  size="md"
                />
              ) : (
                <p className="text-sm text-muted">
                  Open Messages to reply to adopters.
                </p>
              )}
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-end justify-between gap-3">
            <h2 className="text-lg font-semibold tracking-tight">Animals</h2>
            <p className="text-sm text-muted">
              {animals.length} listing{animals.length === 1 ? "" : "s"}
            </p>
          </div>
          <FeedGrid posts={animals} />
        </section>
      </main>
    </div>
  );
}
