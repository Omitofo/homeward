import type { Metadata } from "next";
import Link from "next/link";
import { LegalPageShell } from "@/components/layout/LegalPageShell";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Privacy policy",
  description: `How ${siteConfig.name} collects, uses, and protects your data.`,
};

export default function PrivacyPage() {
  return (
    <LegalPageShell title="Privacy policy" updated="23 September 2026">
      <p>
        {siteConfig.name} ("we", "us") helps people discover animals from rescue
        centers. This policy explains what we collect, why, and the choices you
        have. We aim for minimal data and clear controls.
      </p>

      <h2 className="text-base font-semibold text-foreground">What we collect</h2>
      <ul className="list-disc space-y-2 pl-5 text-muted">
        <li>
          <strong className="text-foreground">Account:</strong> email address and
          display name when you sign up (passwordless magic link — we do not store
          passwords).
        </li>
        <li>
          <strong className="text-foreground">Shelter profile:</strong> organization
          name, handle, bio, links, location fields, and optional avatar.
        </li>
        <li>
          <strong className="text-foreground">Activity:</strong> likes, comments,
          saved searches, chat messages you send, and reports you submit.
        </li>
        <li>
          <strong className="text-foreground">Media:</strong> photos shelters upload
          (re-encoded server-side; location EXIF is stripped).
        </li>
        <li>
          <strong className="text-foreground">Verification docs:</strong> files
          shelters submit for review, stored in a private bucket visible only to the
          shelter and admins.
        </li>
        <li>
          <strong className="text-foreground">Technical:</strong> standard server logs
          (IP, user-agent) for security and reliability, retained briefly.
        </li>
      </ul>

      <h2 className="text-base font-semibold text-foreground">How we use data</h2>
      <p className="text-muted">
        To operate the product: authentication, public profiles and posts, likes and
        comments, messaging between adopters and shelters, moderation, and
        verification. We do not sell personal data. We do not show public email or
        phone numbers; contact happens through in-app chat.
      </p>

      <h2 className="text-base font-semibold text-foreground">Legal bases (GDPR-style)</h2>
      <p className="text-muted">
        Contract / service delivery (your account and core features), legitimate
        interests (security, abuse prevention, product improvement), and consent
        where required (e.g. optional marketing — not used in the MVP).
      </p>

      <h2 className="text-base font-semibold text-foreground">Sharing</h2>
      <p className="text-muted">
        Infrastructure providers that process data on our behalf (hosting, database,
        email delivery for magic links). Public content you post (animal listings,
        comments, shelter bio) is visible to visitors. Chat is visible only to
        participants and admins for safety reviews.
      </p>

      <h2 className="text-base font-semibold text-foreground">Retention</h2>
      <p className="text-muted">
        Account data is kept while your account is active. After deletion we soft-delete
        profile data and stop using it for the product; backups may retain residual
        copies for a limited recovery window. Verification documents are removed or
        restricted when a request is closed according to admin practice.
      </p>

      <h2 className="text-base font-semibold text-foreground">Your rights</h2>
      <p className="text-muted">
        You can access, export, and delete your account data from{" "}
        <Link href="/me" className="font-medium text-primary underline-offset-4 hover:underline">
          Your account
        </Link>
        . You may also contact us using the details on the{" "}
        <Link href="/about" className="font-medium text-primary underline-offset-4 hover:underline">
          About
        </Link>{" "}
        page. Depending on your region you may have rights to rectification,
        restriction, objection, and complaint to a supervisory authority.
      </p>

      <h2 className="text-base font-semibold text-foreground">Security</h2>
      <p className="text-muted">
        We use HTTPS, row-level security in the database, role checks on the server,
        and upload validation. No method is perfectly secure; report suspected issues
        via the About page.
      </p>

      <h2 className="text-base font-semibold text-foreground">Children</h2>
      <p className="text-muted">
        The service is not directed at children under 16. If you believe a minor has
        created an account, contact us to remove it.
      </p>

      <h2 className="text-base font-semibold text-foreground">Changes</h2>
      <p className="text-muted">
        We will update this page when practices change. The "Last updated" date at the
        top reflects the latest revision.
      </p>
    </LegalPageShell>
  );
}
