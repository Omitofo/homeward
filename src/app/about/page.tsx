import type { Metadata } from "next";
import Link from "next/link";
import { LegalPageShell } from "@/components/layout/LegalPageShell";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "About",
  description: `What ${siteConfig.name} is and how to reach us.`,
};

export default function AboutPage() {
  return (
    <LegalPageShell title={`About ${siteConfig.name}`} updated="23 September 2026">
      <p>{siteConfig.description}</p>

      <h2 className="text-base font-semibold text-foreground">What we are building</h2>
      <p className="text-muted">
        A calm, mobile-first feed where verified rescue centers publish animals and people
        can browse, filter, like, comment, and message — without turning adoption into a
        marketplace of impulse buys. Motion is intentional and optional.
      </p>

      <h2 className="text-base font-semibold text-foreground">Trust</h2>
      <p className="text-muted">
        Verification, reporting, private document storage, and chat safety banners are
        part of the core product. Read our{" "}
        <Link href="/safety" className="font-medium text-primary underline-offset-4 hover:underline">
          Safety
        </Link>{" "}
        guide before meeting any animal.
      </p>

      <h2 className="text-base font-semibold text-foreground">Contact</h2>
      <p className="text-muted">
        For privacy requests, security reports, or partnership questions, email{" "}
        <a
          href="mailto:hello@homeward.example"
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          hello@homeward.example
        </a>
        . Replace this address with your real contact before production launch.
      </p>

      <h2 className="text-base font-semibold text-foreground">Legal</h2>
      <ul className="list-disc space-y-2 pl-5 text-muted">
        <li>
          <Link href="/privacy" className="font-medium text-primary underline-offset-4 hover:underline">
            Privacy policy
          </Link>
        </li>
        <li>
          <Link href="/terms" className="font-medium text-primary underline-offset-4 hover:underline">
            Terms of use
          </Link>
        </li>
      </ul>
    </LegalPageShell>
  );
}
