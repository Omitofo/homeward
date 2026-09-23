import type { Metadata } from "next";
import Link from "next/link";
import { LegalPageShell } from "@/components/layout/LegalPageShell";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Terms of use",
  description: `Rules for using ${siteConfig.name}.`,
};

export default function TermsPage() {
  return (
    <LegalPageShell title="Terms of use" updated="23 September 2026">
      <p>
        By using {siteConfig.name} you agree to these terms. If you do not agree, do
        not use the service.
      </p>

      <h2 className="text-base font-semibold text-foreground">What the service is</h2>
      <p className="text-muted">
        {siteConfig.name} is a discovery and messaging platform connecting people with
        rescue centers that list animals for adoption. We are not a shelter, do not own
        the animals listed, and do not complete adoption contracts on your behalf.
        Adoption decisions and legal transfer happen between you and the rescue center.
      </p>

      <h2 className="text-base font-semibold text-foreground">Accounts</h2>
      <ul className="list-disc space-y-2 pl-5 text-muted">
        <li>You must provide accurate information and keep access to your email secure.</li>
        <li>One account, one role (adopter or shelter). Admin roles are assigned manually.</li>
        <li>You are responsible for activity under your account.</li>
        <li>We may suspend accounts that abuse the service or violate these terms.</li>
      </ul>

      <h2 className="text-base font-semibold text-foreground">Acceptable use</h2>
      <p className="text-muted">You agree not to:</p>
      <ul className="list-disc space-y-2 pl-5 text-muted">
        <li>Post false, misleading, or illegal content (including fake rescues or scams).</li>
        <li>Harass, spam, or attempt to defraud other users.</li>
        <li>Request or send payments through chat for animals without meeting appropriate rescue standards.</li>
        <li>Scrape, overload, or attempt to bypass security or access controls.</li>
        <li>Upload malware or content that infringes others&apos; rights.</li>
      </ul>

      <h2 className="text-base font-semibold text-foreground">Shelter listings</h2>
      <p className="text-muted">
        Shelters represent that they have authority to list the animals they post and
        that photos and descriptions are accurate. Verified badges are granted by admins
        after review and may be revoked. Verification is not a guarantee of outcomes.
      </p>

      <h2 className="text-base font-semibold text-foreground">Content license</h2>
      <p className="text-muted">
        You keep ownership of content you submit. You grant us a non-exclusive license to
        host, display, and distribute that content as needed to operate the service
        (including public feed and profiles).
      </p>

      <h2 className="text-base font-semibold text-foreground">Disclaimer</h2>
      <p className="text-muted">
        The service is provided "as is". We do not warrant uninterrupted availability or
        that listings are complete or error-free. To the fullest extent permitted by law,
        we are not liable for adoption outcomes, third-party conduct, or indirect damages.
      </p>

      <h2 className="text-base font-semibold text-foreground">Privacy</h2>
      <p className="text-muted">
        Our{" "}
        <Link href="/privacy" className="font-medium text-primary underline-offset-4 hover:underline">
          Privacy policy
        </Link>{" "}
        explains how we handle personal data.
      </p>

      <h2 className="text-base font-semibold text-foreground">Changes</h2>
      <p className="text-muted">
        We may update these terms. Continued use after changes constitutes acceptance of
        the revised terms. Material changes will be reflected in the date above.
      </p>
    </LegalPageShell>
  );
}
