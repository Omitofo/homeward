"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Badge, Button } from "@/components/ui";
import { resolveReport } from "./actions";
import type { ReportRow } from "./schema";

type Props = { row: ReportRow };

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

  return (
    <article className="rounded-lg border border-border bg-card p-5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-sm font-medium">
            {row.targetType}{" "}
            <span className="font-mono text-xs text-muted">{row.targetId}</span>
          </p>
          <p className="mt-0.5 text-xs text-muted">
            {new Date(row.createdAt).toLocaleString()}
          </p>
        </div>
        <Badge variant="neutral">{row.status}</Badge>
      </div>

      <p className="mt-3 text-sm">
        <span className="font-medium">Reason:</span> {row.reason}
      </p>

      {row.targetType === "post" ? (
        <p className="mt-2 text-sm">
          <Link
            href={`/post/${row.targetId}`}
            className="font-medium text-primary hover:underline"
          >
            View post
          </Link>
        </p>
      ) : null}

      <div className="mt-4 flex flex-col gap-1.5">
        <label htmlFor={`rn-${row.id}`} className="text-sm font-medium">
          Resolution note
        </label>
        <textarea
          id={`rn-${row.id}`}
          rows={2}
          maxLength={1000}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
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
          variant="secondary"
          disabled={busy}
          onClick={() => void act("dismiss")}
        >
          Dismiss
        </Button>
        {row.targetType === "comment" ? (
          <Button
            type="button"
            variant="danger"
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
            disabled={busy}
            onClick={() => void act("archive_post")}
          >
            Archive post
          </Button>
        ) : null}
      </div>
    </article>
  );
}
