"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { deleteAccount, exportAccountData } from "./account-actions";

export function AccountPrivacy() {
  const [error, setError] = useState<string | null>(null);
  const [exporting, startExport] = useTransition();
  const [deleting, startDelete] = useTransition();
  const [confirmDelete, setConfirmDelete] = useState(false);

  function onExport() {
    setError(null);
    startExport(async () => {
      const result = await exportAccountData();
      if (!result.ok) {
        setError(result.error);
        return;
      }
      const blob = new Blob([JSON.stringify(result.data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `homeward-data-export-${result.data.exportedAt.slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    });
  }

  function onDelete() {
    setError(null);
    startDelete(async () => {
      const result = await deleteAccount();
      // redirect on success; if we get a result it failed
      if (result && !result.ok) {
        setError(result.error);
        setConfirmDelete(false);
      }
    });
  }

  return (
    <section className="mt-10 space-y-4" aria-labelledby="privacy-heading">
      <h2
        id="privacy-heading"
        className="text-sm font-semibold uppercase tracking-wide text-muted"
      >
        Privacy & data
      </h2>
      <p className="text-sm text-muted">
        Download a copy of your account data, or permanently close your account.
        Deletion signs you out and soft-deletes your profile. Shelter listings are
        archived.
      </p>

      <div className="flex flex-wrap gap-3">
        <Button
          type="button"
          variant="secondary"
          size="md"
          disabled={exporting || deleting}
          onClick={onExport}
        >
          {exporting ? "Preparing…" : "Download my data"}
        </Button>

        {!confirmDelete ? (
          <Button
            type="button"
            variant="danger"
            size="md"
            disabled={exporting || deleting}
            onClick={() => setConfirmDelete(true)}
          >
            Delete account
          </Button>
        ) : (
          <div className="flex w-full flex-col gap-2 rounded-lg border border-danger/40 bg-danger/5 p-4 sm:w-auto">
            <p className="text-sm text-foreground">
              This cannot be undone from the app. Continue?
            </p>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="danger"
                size="sm"
                disabled={deleting}
                onClick={onDelete}
              >
                {deleting ? "Deleting…" : "Yes, delete my account"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={deleting}
                onClick={() => setConfirmDelete(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>

      {error && (
        <p className="text-sm text-danger" role="alert">
          {error}
        </p>
      )}
    </section>
  );
}
