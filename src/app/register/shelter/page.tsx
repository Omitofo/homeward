import type { Metadata } from "next";
import Link from "next/link";
import { MagicLinkForm } from "@/features/auth";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Shelter sign-up",
  robots: { index: false, follow: false },
};

export default function ShelterRegisterPage() {
  return (
    <div className="mx-auto flex min-h-full max-w-md flex-col justify-center px-4 py-12">
      <div className="mb-8 text-center">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          {siteConfig.name}
        </Link>
        <h1 className="mt-4 text-2xl font-semibold tracking-tight">
          Register your rescue
        </h1>
        <p className="mt-2 text-sm text-muted">
          Create a shelter account to post animals. Verification is a separate
          step after you join.
        </p>
      </div>

      <MagicLinkForm mode="shelter" next="/studio" />

      <p className="mt-6 text-center text-sm text-muted">
        Looking to adopt instead?{" "}
        <Link href="/register" className="font-medium text-primary hover:underline">
          Adopter sign-up
        </Link>
      </p>
    </div>
  );
}
