"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Badge, Button } from "@/components/ui";
import {
  reviewVerificationRequest,
  type AdminVerificationRow,
} from "./admin-actions";

type Props = {
  row: AdminVerificationRow;
};

export function AdminReviewCard({ row }: Props) {
  const router = useRouter();
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const act = async (decision: "approved" | "rejected" | "needs_info") => {
    setError(null);
    setBusy(true);
    try {
      const result = await reviewVerificationRequest({
        requestId: row.id,
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
            {row.shelterOrgName ?? "Shelter"}{" "}
            {row.shelterHandle ? (
              <span className="text-muted">@{row.shelterHandle}</span>
            ) : null}
          </h2>
          <p className="mt-0.5 text-xs text-muted">
            Submitted {new Date(row.createdAt).toLocaleString()}
          </p>
        </div>
        <Badge variant="neutral">{row.status}</Badge>
      </div>

      <p className="mt-3 whitespace-pre-wrap text-sm">{row.notes}</p>

      {row.documents.length > 0 ? (
        <ul className="mt-3 space-y-1 text-sm">
          {row.documents.map((d, i) => (
            <li key={`${d.path}-${i}`} className="text-muted">
              <span className="font-medium text-foreground">{d.fileName}</span>{" "}
              · {d.mime} · {(d.size / 1024).toFixed(0)} KB
              <span className="ml-1 font-mono text-[11px]">{d.path}</span>
            </li>
          ))}
        </ul>
      ) : null}

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
          placeholder="Optional feedback for the shelter"
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>

      {error ? (
        <p className="mt-2 text-sm text-danger" role="alert">
          {error}
        </p>
      ) : null}

      <div className="mt-4 flex flex-wrap gap-2">
        <Button
          type="button"
          disabled={busy}
          onClick={() => void act("approved")}
        >
          Approve
        </Button>
        <Button
          type="button"
          variant="secondary"
          disabled={busy}
          onClick={() => void act("needs_info")}
        >
          Needs info
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
