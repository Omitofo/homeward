import type { Metadata } from "next";
import Link from "next/link";
import { MagicLinkForm } from "@/features/auth";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Create account",
  robots: { index: false, follow: false },
};

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function RegisterPage({ searchParams }: Props) {
  const params = await searchParams;
  const next =
    typeof params.next === "string" ? params.next : undefined;

  return (
    <main
      id="main-content"
      className="mx-auto flex min-h-full max-w-md flex-col justify-center px-4 py-12"
    >
      <div className="mb-8 text-center">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          {siteConfig.name}
        </Link>
        <h1 className="mt-4 text-2xl font-semibold tracking-tight">
          Join as an adopter
        </h1>
        <p className="mt-2 text-sm text-muted">
          Like, comment, and message shelters. We only need your name and email.
        </p>
      </div>

      <MagicLinkForm mode="adopter" next={next} />

      <p className="mt-6 text-center text-sm text-muted">
        Already have an account?{" "}
        <Link
          href={next ? `/login?next=${encodeURIComponent(next)}` : "/login"}
          className="font-medium text-primary hover:underline"
        >
          Sign in
        </Link>
        <br />
        Represent a rescue center?{" "}
        <Link href="/register/shelter" className="font-medium text-primary hover:underline">
          Shelter sign-up
        </Link>
      </p>
    </main>
  );
}
