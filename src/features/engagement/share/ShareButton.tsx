"use client";

import { useState } from "react";
import { Button } from "@/components/ui";
import { Share } from "@/components/icons";

type Props = {
  url: string;
  title: string;
  text?: string;
  size?: "sm" | "md" | "lg" | "icon";
  iconOnly?: boolean;
};

function resolveUrl(url: string): string {
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  if (typeof window !== "undefined") {
    return new URL(url, window.location.origin).toString();
  }
  return url;
}

export function ShareButton({
  url,
  title,
  text,
  size = "icon",
  iconOnly = true,
}: Props) {
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
      if (
        typeof navigator !== "undefined" &&
        typeof navigator.share === "function"
      ) {
        await navigator.share(payload);
        setStatus("Shared");
        return;
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
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
      <Button
        type="button"
        variant="ghost"
        size={iconOnly ? "icon" : size}
        onClick={onShare}
        title="Share"
        aria-label="Share"
      >
        <Share size={24} />
        {!iconOnly ? <span>Share</span> : null}
      </Button>
      {status && (
        <p className="text-xs text-muted" role="status">
          {status}
        </p>
      )}
    </div>
  );
}
