"use client";

import { useEffect } from "react";
import { reportError } from "@/lib/monitoring";

type Props = {
  error: Error & { digest?: string };
  reset: () => void;
};

/**
 * Replaces the root layout when a critical error escapes.
 * Must include its own <html> and <body>.
 */
export default function GlobalError({ error, reset }: Props) {
  useEffect(() => {
    reportError(error, {
      digest: error.digest,
      source: "app/global-error",
    });
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          fontFamily: "system-ui, sans-serif",
          display: "flex",
          minHeight: "100vh",
          alignItems: "center",
          justifyContent: "center",
          background: "#fafaf9",
          color: "#1c1917",
        }}
      >
        <main
          id="main-content"
          role="alert"
          style={{ textAlign: "center", padding: "1.5rem", maxWidth: "24rem" }}
        >
          <p style={{ fontSize: "0.875rem", color: "#78716c" }}>Error</p>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 600 }}>Something went wrong</h1>
          <p style={{ color: "#78716c", marginTop: "0.5rem" }}>
            A critical error occurred. Please try again.
          </p>
          <button
            type="button"
            onClick={reset}
            style={{
              marginTop: "1.25rem",
              height: "2.5rem",
              padding: "0 1rem",
              borderRadius: "0.375rem",
              border: "none",
              background: "#0d9488",
              color: "#fff",
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            Try again
          </button>
          {error.digest && (
            <p style={{ marginTop: "1rem", fontSize: "0.75rem", fontFamily: "monospace", color: "#a8a29e" }}>
              Ref: {error.digest}
            </p>
          )}
        </main>
      </body>
    </html>
  );
}
