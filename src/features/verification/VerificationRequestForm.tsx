"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui";
import { submitVerificationRequest } from "./actions";
import { MAX_DOC_BYTES } from "./constants";
import { uploadVerificationDoc } from "./upload";
import type { VerificationDocInput } from "./schema";

export function VerificationRequestForm() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const [notes, setNotes] = useState("");
  const [docs, setDocs] = useState<VerificationDocInput[]>([]);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onPick = useCallback(async (fileList: FileList | null) => {
    if (!fileList?.length) return;
    setError(null);

    const remaining = 5 - docs.length;
    if (remaining <= 0) {
      setError("Maximum 5 documents");
      return;
    }

    const files = Array.from(fileList).slice(0, remaining);
    setUploading(true);
    try {
      for (const file of files) {
        if (file.size > MAX_DOC_BYTES) {
          setError(`File too large (max ${MAX_DOC_BYTES / (1024 * 1024)} MB)`);
          continue;
        }
        const fd = new FormData();
        fd.set("file", file);
        const result = await uploadVerificationDoc(fd);
        if (!result.ok) {
          setError(result.error);
          continue;
        }
        setDocs((prev) => [...prev, result.data]);
      }
    } catch {
      setError("Upload failed");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }, [docs.length]);

  const removeDoc = (index: number) => {
    setDocs((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const result = await submitVerificationRequest({
        notes,
        documents: docs,
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.refresh();
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="vr-notes" className="text-sm font-medium">
          About your rescue
        </label>
        <textarea
          id="vr-notes"
          required
          rows={5}
          maxLength={2000}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Tell us how you operate, where animals come from, registration or membership numbers, and any public references we can check."
          className="w-full rounded-md border border-input bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
        <p className="text-xs text-muted">{notes.length}/2000</p>
      </div>

      <div>
        <h3 className="text-sm font-medium">Supporting documents</h3>
        <p className="mt-1 text-xs text-muted">
          Registration certificate, website screenshots, or other proof. PDF or
          images · max {MAX_DOC_BYTES / (1024 * 1024)} MB · up to 5 files · stored
          privately (not public).
        </p>

        <div className="mt-3 flex flex-wrap items-center gap-3">
          <input
            ref={inputRef}
            type="file"
            accept="application/pdf,image/jpeg,image/png,image/webp"
            multiple
            className="sr-only"
            id="vr-docs"
            disabled={uploading || docs.length >= 5}
            onChange={(e) => void onPick(e.target.files)}
          />
          <Button
            type="button"
            variant="secondary"
            disabled={uploading || docs.length >= 5}
            onClick={() => inputRef.current?.click()}
          >
            {uploading ? "Uploading…" : "Add document"}
          </Button>
        </div>

        {docs.length > 0 ? (
          <ul className="mt-3 space-y-2">
            {docs.map((d, i) => (
              <li
                key={`${d.path}-${i}`}
                className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border bg-background px-3 py-2 text-sm"
              >
                <span className="truncate font-medium">{d.fileName}</span>
                <span className="text-xs text-muted">
                  {d.mime} · {(d.size / 1024).toFixed(0)} KB
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeDoc(i)}
                >
                  Remove
                </Button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      {error ? (
        <p className="text-sm text-danger" role="alert">
          {error}
        </p>
      ) : null}

      <Button type="submit" disabled={busy || uploading}>
        {busy ? "Submitting…" : "Submit verification request"}
      </Button>
    </form>
  );
}
