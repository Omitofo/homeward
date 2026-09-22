"use client";

import { useState } from "react";
import { Button } from "@/components/ui";
import { AuthSheet } from "@/features/auth/components/AuthSheet";
import type { AuthIntent } from "@/features/auth/intent";
import { submitReport } from "./actions";
import { REPORT_REASONS } from "./schema";

type Props = {
  targetType: "post" | "comment";
  targetId: string;
  signedIn: boolean;
  returnTo?: string;
  className?: string;
};

export function ReportButton({
  targetType,
  targetId,
  signedIn,
  returnTo,
  className,
}: Props) {
  const [open, setOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [intent, setIntent] = useState<AuthIntent | null>(null);
  const [reason, setReason] =
    useState<(typeof REPORT_REASONS)[number]>("spam");
  const [details, setDetails] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const start = () => {
    if (!signedIn) {
      setIntent({
        type: "comment",
        returnTo: returnTo ?? "/",
        postId: targetType === "post" ? targetId : undefined,
      });
      setSheetOpen(true);
      return;
    }
    setOpen(true);
    setError(null);
    setDone(false);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const result = await submitReport({
        targetType,
        targetId,
        reason,
        details: details.trim() || undefined,
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setDone(true);
      setOpen(false);
    } catch {
      setError("Could not submit report");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={className}>
      {done ? (
        <span className="text-xs text-muted">Reported</span>
      ) : (
        <button
          type="button"
          onClick={start}
          className="text-xs text-muted hover:text-danger"
        >
          Report
        </button>
      )}

      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center"
          role="dialog"
          aria-modal
          aria-labelledby="report-title"
        >
          <form
            onSubmit={onSubmit}
            className="w-full max-w-md space-y-4 rounded-lg border border-border bg-card p-5 shadow-lg"
          >
            <h2 id="report-title" className="text-base font-semibold">
              Report {targetType}
            </h2>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="report-reason" className="text-sm font-medium">
                Reason
              </label>
              <select
                id="report-reason"
                value={reason}
                onChange={(e) =>
                  setReason(e.target.value as (typeof REPORT_REASONS)[number])
                }
                className="h-10 rounded-md border border-input bg-background px-3 text-sm"
              >
                {REPORT_REASONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="report-details" className="text-sm font-medium">
                Details (optional)
              </label>
              <textarea
                id="report-details"
                rows={3}
                maxLength={400}
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            {error ? (
              <p className="text-sm text-danger" role="alert">
                {error}
              </p>
            ) : null}
            <div className="flex flex-wrap gap-2">
              <Button type="submit" disabled={busy}>
                {busy ? "Sending…" : "Submit report"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                disabled={busy}
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      ) : null}

      <AuthSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        intent={intent}
        next={returnTo ?? "/"}
      />
    </div>
  );
}
