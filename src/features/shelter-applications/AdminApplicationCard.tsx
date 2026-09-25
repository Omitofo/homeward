"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Badge, Button } from "@/components/ui";
import {
  reviewShelterApplication,
  type AdminShelterApplicationRow,
} from "./admin-actions";

type Props = {
  row: AdminShelterApplicationRow;
};

export function AdminApplicationCard({ row }: Props) {
  const router = useRouter();
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const act = async (decision: "approved" | "rejected") => {
    setError(null);
    setBusy(true);
    try {
      const result = await reviewShelterApplication({
        applicationId: row.id,
        decision,
        reviewNote: note,
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.refresh();
    } catch {
      setError("Review failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <article className="rounded-lg border border-border bg-card p-5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 className="font-medium">
            {row.orgName}{" "}
            <span className="text-muted">@{row.handle}</span>
          </h2>
          <p className="mt-0.5 text-xs text-muted">
            {row.displayName ? `${row.displayName} · ` : ""}
            Submitted {new Date(row.createdAt).toLocaleString()}
          </p>
        </div>
        <Badge variant="neutral">{row.status}</Badge>
      </div>

      <dl className="mt-3 grid gap-1 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-xs text-muted">Country</dt>
          <dd>{row.countryCode || "—"}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted">Website</dt>
          <dd className="truncate">
            {row.website ? (
              <a
                href={row.website.startsWith("http") ? row.website : `https://${row.website}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                {row.website}
              </a>
            ) : (
              "—"
            )}
          </dd>
        </div>
      </dl>

      {row.message ? (
        <p className="mt-3 whitespace-pre-wrap text-sm">{row.message}</p>
      ) : (
        <p className="mt-3 text-sm text-muted">No message provided.</p>
      )}

      <div className="mt-4 flex flex-col gap-1.5">
        <label htmlFor={`note-${row.id}`} className="text-sm font-medium">
          Review note
        </label>
        <textarea
          id={`note-${row.id}`}
          rows={2}
          maxLength={2000}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Optional — internal or feedback after a call/email"
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>

      {error ? (
        <p className="mt-2 text-sm text-danger" role="alert">
          {error}
        </p>
      ) : null}

      <div className="mt-4 flex flex-wrap gap-2">
        <Button type="button" disabled={busy} onClick={() => void act("approved")}>
          Approve &amp; create shelter
        </Button>
        <Button
          type="button"
          variant="danger"
          disabled={busy}
          onClick={() => void act("rejected")}
        >
          Reject
        </Button>
      </div>
    </article>
  );
}
