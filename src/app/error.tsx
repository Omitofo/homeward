"use client";

import { useEffect } from "react";
import Link from "next/link";
import { reportError } from "@/lib/monitoring";

type Props = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function AppError({ error, reset }: Props) {
  useEffect(() => {
    reportError(error, {
      digest: error.digest,
      source: "app/error",
    });
  }, [error]);

  return (
    <main
      id="main-content"
      className="flex min-h-[70vh] flex-col items-center justify-center gap-4 px-4 text-center"
      role="alert"
    >
      <p className="text-sm font-medium uppercase tracking-wide text-muted">Error</p>
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">
        Something went wrong
      </h1>
      <p className="max-w-sm text-muted">
        We hit an unexpected problem. You can try again or go back to the feed.
      </p>
      <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:opacity-90"
        >
          Try again
        </button>
        <Link
          href="/explore"
          className="text-sm font-medium text-muted underline-offset-4 hover:text-foreground hover:underline"
        >
          Explore
        </Link>
      </div>
      {error.digest && (
        <p className="mt-4 font-mono text-xs text-muted">Ref: {error.digest}</p>
      )}
    </main>
  );
}
