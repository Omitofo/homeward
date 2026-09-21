"use client";

import { useState } from "react";
import { Button } from "@/components/ui";

type Props = {
  /** Absolute or path URL of the post */
  url: string;
  title: string;
  text?: string;
  size?: "sm" | "md" | "lg";
};

function resolveUrl(url: string): string {
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  if (typeof window !== "undefined") {
    return new URL(url, window.location.origin).toString();
  }
  return url;
}

/**
 * Share a post. Prefer the native Web Share sheet; fall back to clipboard.
 * Available to visitors — no sign-in required (doc 02).
 */
export function ShareButton({ url, title, text, size = "lg" }: Props) {
  const [status, setStatus] = useState<string | null>(null);

  async function onShare() {
    setStatus(null);
    const fullUrl = resolveUrl(url);
    const payload = {
      title,
      text: text ?? `Meet ${title} on Homeward`,
      url: fullUrl,
    };

    try {
      if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
        await navigator.share(payload);
        setStatus("Shared");
        return;
      }
    } catch (err) {
      // User cancelled the share sheet — not an error
      if (err instanceof DOMException && err.name === "AbortError") return;
      // Fall through to clipboard
    }

    try {
      await navigator.clipboard.writeText(fullUrl);
      setStatus("Link copied");
      window.setTimeout(() => setStatus(null), 2000);
    } catch {
      setStatus("Could not copy link");
    }
  }

  return (
    <div className="flex flex-col gap-1">
      <Button type="button" variant="ghost" size={size} onClick={onShare}>
        Share
      </Button>
      {status && (
        <p className="text-xs text-muted" role="status">
          {status}
        </p>
      )}
    </div>
  );
}
