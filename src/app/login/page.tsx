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

function errorMessage(
  code: string | undefined,
  detail: string | undefined,
): string | null {
  if (!code) return null;
  if (code === "shelter_promote" && detail) return detail;
  if (code === "shelter_promote") {
    return "Signed in, but your shelter profile could not be activated. Check SUPABASE_SERVICE_ROLE_KEY and try register/shelter again.";
  }
  if (code === "missing_code") {
    return "That magic link is missing a code. Request a new one.";
  }
  if (code === "not_configured") {
    return "Auth is not configured (missing Supabase env vars).";
  }
  if (code === "auth_callback") {
    return "This magic link is invalid, expired, or already used. Request a fresh link (Supabase free email allows only ~2 messages/hour). Open the newest email in the same browser you started from.";
  }
  return "Something went wrong confirming your link. Please try again.";
}

export default async function LoginPage({ searchParams }: Props) {
  const params = await searchParams;
  const next =
    typeof params.next === "string" ? params.next : undefined;
  const error =
    typeof params.error === "string" ? params.error : undefined;
  const detail =
    typeof params.detail === "string" ? params.detail : undefined;
  const message = errorMessage(error, detail);

  return (
    <main
      id="main-content"
      className="mx-auto flex min-h-full max-w-md flex-col justify-center px-4 py-12"
    >
      <div className="mb-8 text-center">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          {siteConfig.name}
        </Link>
        <h1 className="mt-4 text-2xl font-semibold tracking-tight">Sign in</h1>
        <p className="mt-2 text-sm text-muted">
          We will email you a one-time magic link. No password needed.
        </p>
      </div>

      {message && (
        <p
          className="mb-4 rounded-md border border-danger/30 bg-danger/5 px-3 py-2 text-sm text-danger"
          role="alert"
        >
          {message}
        </p>
      )}

      <MagicLinkForm mode="signin" next={next} />

      <p className="mt-6 text-center text-sm text-muted">
        New here?{" "}
        <Link
          href={next ? `/register?next=${encodeURIComponent(next)}` : "/register"}
          className="font-medium text-primary hover:underline"
        >
          Create an account
        </Link>
        {" · "}
        <Link
          href="/register/shelter"
          className="font-medium text-primary hover:underline"
        >
          I represent a rescue
        </Link>
      </p>
    </main>
  );
}
