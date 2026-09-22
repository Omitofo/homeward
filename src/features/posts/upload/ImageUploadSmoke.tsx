"use client";

import { useCallback, useRef, useState } from "react";
import { Button } from "@/components/ui";
import { MAX_UPLOAD_BYTES } from "@/lib/media";
import { uploadAnimalImage, type UploadedMedia } from "./actions";

type Item = UploadedMedia & { localPreview?: string };

export function ImageUploadSmoke() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onPick = useCallback(async (fileList: FileList | null) => {
    if (!fileList?.length) return;
    setError(null);

    const file = fileList[0];
    if (file.size > MAX_UPLOAD_BYTES) {
      setError(`File too large (max ${MAX_UPLOAD_BYTES / (1024 * 1024)} MB)`);
      return;
    }

    setBusy(true);
    try {
      const fd = new FormData();
      fd.set("file", file);
      const result = await uploadAnimalImage(fd);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      const localPreview = URL.createObjectURL(file);
      setItems((prev) => [...prev, { ...result.data, localPreview }]);
    } catch {
      setError("Unexpected upload error");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          className="sr-only"
          id="animal-image-upload"
          disabled={busy}
          onChange={(e) => void onPick(e.target.files)}
        />
        <Button
          type="button"
          variant="secondary"
          disabled={busy}
          onClick={() => inputRef.current?.click()}
        >
          {busy ? "Uploading…" : "Choose image"}
        </Button>
        <p className="text-xs text-muted">
          JPEG / PNG / WebP / AVIF · max {MAX_UPLOAD_BYTES / (1024 * 1024)} MB ·
          EXIF stripped server-side
        </p>
      </div>

      {error ? (
        <p className="text-sm text-danger" role="alert">
          {error}
        </p>
      ) : null}

      {items.length > 0 ? (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {items.map((item) => (
            <li
              key={item.storagePath}
              className="overflow-hidden rounded-lg border border-border bg-card"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.localPreview ?? item.publicUrl}
                alt=""
                className="aspect-[4/5] w-full object-cover"
              />
              <div className="space-y-0.5 p-2 text-[11px] leading-snug text-muted">
                <p className="truncate font-mono">{item.storagePath}</p>
                <p>
                  {item.width}×{item.height}
                  {item.mock ? " · mock" : ""}
                </p>
              </div>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
