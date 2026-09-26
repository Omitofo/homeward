import Link from "next/link";
import { Badge } from "@/components/ui";
import type { MyShelterApplication } from "./my-application";

type Props = {
  application: MyShelterApplication;
  /** Set when redirected from register with ?applied=shelter */
  justApplied?: boolean;
};

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      timeZone: "UTC",
    });
  } catch {
    return iso;
  }
}

/**
 * Account banner for adopters who requested shelter access and are
 * waiting on (or received) an admin decision.
 */
export function ShelterApplicationStatusCard({
  application,
  justApplied = false,
}: Props) {
  if (application.status === "approved") {
    // Role should already be shelter; keep a soft success if lag exists
    return (
      <section
        className="mt-6 rounded-2xl border border-status-available/30 bg-status-available/10 px-5 py-4"
        aria-live="polite"
      >
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-sm font-semibold tracking-tight text-foreground">
            Shelter access approved
          </h2>
          <Badge variant="available" withDot>
            Approved
          </Badge>
        </div>
        <p className="mt-2 text-sm text-muted">
          <span className="font-medium text-foreground">{application.orgName}</span>
          {" "}
          (@{application.handle}) is ready. Open Studio to post animals.
        </p>
        <p className="mt-3">
          <Link
            href="/studio"
            className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            Open Studio
          </Link>
        </p>
      </section>
    );
  }

  if (application.status === "rejected") {
    return (
      <section
        className="mt-6 rounded-2xl border border-danger/25 bg-danger/5 px-5 py-4"
        aria-live="polite"
      >
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-sm font-semibold tracking-tight text-foreground">
            Shelter application not approved
          </h2>
          <Badge variant="neutral">Rejected</Badge>
        </div>
        <p className="mt-2 text-sm text-muted">
          Your request for{" "}
          <span className="font-medium text-foreground">{application.orgName}</span>
          {" "}
          (@{application.handle}) was not approved.
        </p>
        {application.reviewNote ? (
          <p className="mt-2 rounded-lg bg-background/60 px-3 py-2 text-sm text-foreground">
            {application.reviewNote}
          </p>
        ) : null}
        <p className="mt-3 text-sm">
          <Link
            href="/register/shelter"
            className="font-medium text-primary hover:underline"
          >
            Submit a new request
          </Link>
        </p>
      </section>
    );
  }

  // pending
  return (
    <section
      className="mt-6 rounded-2xl border border-status-reserved/35 bg-status-reserved/10 px-5 py-4"
      aria-live="polite"
    >
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="text-sm font-semibold tracking-tight text-foreground">
          {justApplied ? "Application received" : "Shelter application pending"}
        </h2>
        <Badge variant="reserved" withDot>
          Pending review
        </Badge>
      </div>

      <p className="mt-2 text-sm leading-relaxed text-muted">
        {justApplied ? (
          <>
            Thanks — your rescue request was submitted successfully. Your account
            stays as <span className="font-medium text-foreground">adopter</span>{" "}
            until an admin approves it. After approval you’ll get{" "}
            <span className="font-medium text-foreground">Studio</span> to post
            animals. A separate Verified badge can be requested later with
            documentation.
          </>
        ) : (
          <>
            You’re registered correctly. We’re reviewing{" "}
            <span className="font-medium text-foreground">{application.orgName}</span>
            {" "}
            (@{application.handle}). Until then your role is adopter — Studio
            unlocks after approval. You can still browse and message like any
            member.
          </>
        )}
      </p>

      <dl className="mt-3 grid gap-1 text-xs text-muted sm:grid-cols-2">
        <div>
          <dt className="inline text-muted">Organization</dt>
          {": "}
          <dd className="inline font-medium text-foreground">
            {application.orgName}
          </dd>
        </div>
        <div>
          <dt className="inline text-muted">Handle</dt>
          {": "}
          <dd className="inline font-medium text-foreground">
            @{application.handle}
          </dd>
        </div>
        <div>
          <dt className="inline text-muted">Submitted</dt>
          {": "}
          <dd className="inline font-medium text-foreground">
            {formatDate(application.createdAt)}
          </dd>
        </div>
      </dl>

      <p className="mt-3 text-xs text-muted">
        We may contact you by email if we need more detail. No further action is
        required right now.
      </p>
    </section>
  );
}
