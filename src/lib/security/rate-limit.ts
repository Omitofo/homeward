import "server-only";

/**
 * Simple in-memory sliding-window rate limiter for Server Actions / route handlers.
 * Suitable for a single Node instance (dev, Vercel serverless with caveats).
 * For multi-instance production, swap the store for Redis / Upstash.
 *
 * Usage:
 *   const limited = rateLimit(`comment:${userId}`, { limit: 10, windowMs: 60_000 });
 *   if (!limited.ok) return { ok: false, error: "Too many requests. Try again shortly." };
 */

type Entry = { count: number; resetAt: number };

const store = new Map<string, Entry>();

const MAX_KEYS = 10_000;

function pruneIfNeeded() {
  if (store.size < MAX_KEYS) return;
  const now = Date.now();
  for (const [key, entry] of store) {
    if (entry.resetAt <= now) store.delete(key);
  }
  // Hard cap: drop oldest half if still over limit
  if (store.size >= MAX_KEYS) {
    const keys = [...store.keys()];
    for (let i = 0; i < keys.length / 2; i++) {
      store.delete(keys[i]!);
    }
  }
}

export type RateLimitResult =
  | { ok: true; remaining: number; resetAt: number }
  | { ok: false; remaining: 0; resetAt: number; retryAfterSec: number };

export type RateLimitOptions = {
  /** Max hits in the window (default 20). */
  limit?: number;
  /** Window length in ms (default 60_000). */
  windowMs?: number;
};

export function rateLimit(
  key: string,
  options: RateLimitOptions = {},
): RateLimitResult {
  const limit = options.limit ?? 20;
  const windowMs = options.windowMs ?? 60_000;
  const now = Date.now();

  pruneIfNeeded();

  const existing = store.get(key);
  if (!existing || existing.resetAt <= now) {
    const resetAt = now + windowMs;
    store.set(key, { count: 1, resetAt });
    return { ok: true, remaining: limit - 1, resetAt };
  }

  if (existing.count >= limit) {
    const retryAfterSec = Math.max(1, Math.ceil((existing.resetAt - now) / 1000));
    return {
      ok: false,
      remaining: 0,
      resetAt: existing.resetAt,
      retryAfterSec,
    };
  }

  existing.count += 1;
  return {
    ok: true,
    remaining: limit - existing.count,
    resetAt: existing.resetAt,
  };
}

/** Preset keys / limits aligned with docs/07-SECURITY.md. */
export const RATE_LIMITS = {
  magicLink: { limit: 5, windowMs: 15 * 60_000 },
  /** Password sign-in / sign-up attempts per email. */
  passwordAuth: { limit: 10, windowMs: 15 * 60_000 },
  comment: { limit: 20, windowMs: 60_000 },
  /** Max 50 messages per 30 minutes (all roles). */
  message: { limit: 50, windowMs: 30 * 60_000 },
  upload: { limit: 30, windowMs: 60 * 60_000 },
  report: { limit: 10, windowMs: 60 * 60_000 },
  startChat: { limit: 10, windowMs: 60 * 60_000 },
} as const;
