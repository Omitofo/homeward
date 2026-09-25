"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Badge, Button } from "@/components/ui";
import { resolveReport } from "./actions";
import type { ReportRow, ReportTargetPreview } from "./schema";

type Props = { row: ReportRow };

/** Fixed locale so SSR and client match (avoids hydration mismatch). */
function formatReportTime(iso: string): string {
  try {
    return (
      new Date(iso).toLocaleString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
        timeZone: "UTC",
      }) + " UTC"
    );
  } catch {
    return iso;
  }
}

function formatReason(reason: string): string {
  const [head, ...rest] = reason.split(":");
  const label = (head ?? reason).trim();
  const pretty = label.charAt(0).toUpperCase() + label.slice(1);
  if (rest.length === 0) return pretty;
  return `${pretty} — ${rest.join(":").trim()}`;
}

function capitalize(s: string): string {
  if (!s) return s;
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function TargetPreview({ target }: { target: ReportTargetPreview }) {
  if (target.kind === "post") {
    if (!target.available) {
      return (
        <div className="rounded-xl border border-dashed border-border bg-secondary/40 px-4 py-3">
          <p className="text-sm text-muted">This post is no longer available.</p>
        </div>
      );
    }
    return (
      <div className="rounded-xl border border-border bg-secondary/30 px-4 py-3">
        <p className="text-[11px] font-medium uppercase tracking-wide text-muted">
          Reported post
        </p>
        <p className="mt-1 text-base font-semibold tracking-tight text-foreground">
          {target.name}
        </p>
        <p className="mt-0.5 text-sm text-muted">
          {[capitalize(target.species), capitalize(target.status)]
            .filter(Boolean)
            .join(" · ")}
        </p>
        <Link
          href={target.href}
          className="mt-2 inline-flex text-sm font-medium text-primary hover:underline"
        >
          View post →
        </Link>
      </div>
    );
  }

  // comment
  if (!target.available) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-secondary/40 px-4 py-3">
        <p className="text-[11px] font-medium uppercase tracking-wide text-muted">
          Reported comment
        </p>
        <p className="mt-1 text-sm text-muted">
          Comment is no longer available (deleted or already removed).
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-secondary/30 px-4 py-3">
      <div className="flex flex-wrap items-center gap-2">
        <p className="text-[11px] font-medium uppercase tracking-wide text-muted">
          Reported comment
        </p>
        {target.hidden ? (
          <Badge variant="neutral" className="text-[10px]">
            Already hidden
          </Badge>
        ) : null}
      </div>
      {target.body ? (
        <blockquote className="mt-2 border-l-2 border-primary/40 pl-3 text-sm leading-relaxed text-foreground">
          <span className="line-clamp-4 whitespace-pre-wrap">
            “{target.body}”
          </span>
        </blockquote>
      ) : (
        <p className="mt-2 text-sm italic text-muted">No comment text</p>
      )}
      <p className="mt-2 text-xs text-muted">
        {target.authorName ? (
          <span className="font-medium text-foreground">{target.authorName}</span>
        ) : (
          <span>Unknown author</span>
        )}
        {target.postName ? (
          <>
            {" · on "}
            <span className="font-medium text-foreground">{target.postName}</span>
            {"’s post"}
          </>
        ) : null}
      </p>
      {target.href ? (
        <Link
          href={target.href}
          className="mt-2 inline-flex text-sm font-medium text-primary hover:underline"
        >
          View on post →
        </Link>
      ) : null}
    </div>
  );
}

export function AdminReportCard({ row }: Props) {
  const router = useRouter();
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const act = async (
    action: "dismiss" | "hide_comment" | "archive_post",
  ) => {
    setBusy(true);
    setError(null);
    try {
      const result = await resolveReport({
        reportId: row.id,
        action,
        note,
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.refresh();
    } catch {
      setError("Failed to resolve");
    } finally {
      setBusy(false);
    }
  };

  const targetLabel = row.targetType === "comment" ? "Comment" : "Post";

  return (
    <article className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-2 border-b border-border/60 px-5 py-4">
        <div>
          <h2 className="text-sm font-semibold tracking-tight text-foreground">
            {targetLabel} reported
          </h2>
          <p className="mt-0.5 text-xs text-muted" suppressHydrationWarning>
            {formatReportTime(row.createdAt)}
          </p>
        </div>
        <Badge variant="neutral" withDot>
          {row.status}
        </Badge>
      </div>

      <div className="space-y-4 px-5 py-4">
        {row.target ? <TargetPreview target={row.target} /> : null}

        <div>
          <p className="text-[11px] font-medium uppercase tracking-wide text-muted">
            Reason
          </p>
          <p className="mt-1 text-sm text-foreground">{formatReason(row.reason)}</p>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor={`rn-${row.id}`} className="text-sm font-medium">
            Internal note{" "}
            <span className="font-normal text-muted">(optional)</span>
          </label>
          <textarea
            id={`rn-${row.id}`}
            rows={2}
            maxLength={1000}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Why dismiss, or what action you took…"
            className="w-full resize-none rounded-xl border border-input bg-background px-3 py-2.5 text-sm placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          <p className="text-[11px] text-muted">
            Stored with the report for other admins. Not shown to users.
          </p>
        </div>

        {error ? (
          <p className="text-sm text-danger" role="alert">
            {error}
          </p>
        ) : null}

        <div className="flex flex-wrap gap-2 pt-1">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={busy}
            onClick={() => void act("dismiss")}
          >
            Dismiss
          </Button>
          {row.targetType === "comment" ? (
            <Button
              type="button"
              variant="danger"
              size="sm"
              disabled={busy}
              onClick={() => void act("hide_comment")}
            >
              Hide comment
            </Button>
          ) : null}
          {row.targetType === "post" ? (
            <Button
              type="button"
              variant="danger"
              size="sm"
              disabled={busy}
              onClick={() => void act("archive_post")}
            >
              Archive post
            </Button>
          ) : null}
        </div>
      </div>
    </article>
  );
}
