import type { Metadata } from "next";
import Link from "next/link";
import { MagicLinkForm } from "@/features/auth";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Sign in",
  robots: { index: false, follow: false },
};

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function LoginPage({ searchParams }: Props) {
  const params = await searchParams;
  const next =
    typeof params.next === "string" ? params.next : undefined;
  const error =
    typeof params.error === "string" ? params.error : undefined;

  return (
    <div className="mx-auto flex min-h-full max-w-md flex-col justify-center px-4 py-12">
      <div className="mb-8 text-center">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          {siteConfig.name}
        </Link>
        <h1 className="mt-4 text-2xl font-semibold tracking-tight">Sign in</h1>
        <p className="mt-2 text-sm text-muted">
          We will email you a one-time magic link. No password needed.
        </p>
      </div>

      {error && (
        <p className="mb-4 rounded-md border border-danger/30 bg-danger/5 px-3 py-2 text-sm text-danger" role="alert">
          Something went wrong confirming your link. Please try again.
        </p>
      )}

      <MagicLinkForm mode="signin" next={next} />

      <p className="mt-6 text-center text-sm text-muted">
        New here?{" "}
        <Link href={next ? `/register?next=${encodeURIComponent(next)}` : "/register"} className="font-medium text-primary hover:underline">
          Create an account
        </Link>
        {" · "}
        <Link href="/register/shelter" className="font-medium text-primary hover:underline">
          I represent a rescue
        </Link>
      </p>
    </div>
  );
}
