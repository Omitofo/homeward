/**
 * Central error reporting for client + server.
 * - Always logs a safe message (no secrets).
 * - Optionally posts to Sentry-compatible DSN envelope or a custom webhook
 *   when env is set (see docs/12-DEPLOY.md).
 *
 * Avoid importing this from the media/sharp path; keep it dependency-light.
 */

export type ErrorContext = {
  digest?: string;
  source?: string;
  extra?: Record<string, string | number | boolean | null | undefined>;
};

function safeMessage(error: unknown): string {
  if (error instanceof Error) return error.message.slice(0, 500);
  if (typeof error === "string") return error.slice(0, 500);
  return "Unknown error";
}

function safeStack(error: unknown): string | undefined {
  if (error instanceof Error && error.stack) {
    return error.stack.slice(0, 4000);
  }
  return undefined;
}

/**
 * Fire-and-forget report. Never throws to callers.
 */
export function reportError(error: unknown, context: ErrorContext = {}): void {
  const message = safeMessage(error);
  const payload = {
    message,
    digest: context.digest,
    source: context.source ?? "app",
    extra: context.extra,
    stack: process.env.NODE_ENV === "development" ? safeStack(error) : undefined,
    ts: new Date().toISOString(),
  };

  try {
    console.error("[reportError]", payload.source, message, context.digest ?? "");
  } catch {
    // ignore
  }

  // Optional: Sentry DSN (browser or server). Minimal envelope via fetch —
  // full @sentry/nextjs can replace this later without changing call sites.
  const sentryDsn = process.env.NEXT_PUBLIC_SENTRY_DSN ?? process.env.SENTRY_DSN;
  if (sentryDsn) {
    void postToSentryLite(sentryDsn, payload).catch(() => undefined);
  }

  const webhook = process.env.ERROR_WEBHOOK_URL;
  if (webhook) {
    void fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).catch(() => undefined);
  }
}

async function postToSentryLite(
  dsn: string,
  payload: {
    message: string;
    digest?: string;
    source?: string;
    extra?: ErrorContext["extra"];
    stack?: string;
    ts: string;
  },
): Promise<void> {
  // DSN: https://<key>@<host>/<project>
  let url: URL;
  try {
    url = new URL(dsn);
  } catch {
    return;
  }
  const publicKey = url.username;
  const projectId = url.pathname.replace(/^\//, "");
  if (!publicKey || !projectId) return;

  const ingest = `${url.protocol}//${url.host}/api/${projectId}/store/`;
  const body = {
    message: payload.message,
    level: "error",
    platform: "javascript",
    timestamp: payload.ts,
    tags: {
      source: payload.source ?? "app",
      digest: payload.digest ?? "",
    },
    extra: payload.extra ?? {},
    exception: payload.stack
      ? {
          values: [
            {
              type: "Error",
              value: payload.message,
              stacktrace: { frames: [{ filename: "app", function: payload.source }] },
            },
          ],
        }
      : undefined,
  };

  await fetch(ingest, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Sentry-Auth": `Sentry sentry_version=7, sentry_key=${publicKey}, sentry_client=homeward/0.1`,
    },
    body: JSON.stringify(body),
  });
}
