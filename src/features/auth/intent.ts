/**
 * Pending action the visitor tried before signing in.
 * Stored in sessionStorage so it survives the magic-link round-trip.
 */

export type AuthIntentType = "like" | "contact" | "save" | "comment";

export type AuthIntent = {
  type: AuthIntentType;
  /** Path to return to, e.g. /post/abc */
  returnTo: string;
  /** Optional entity the action targets */
  postId?: string;
  label?: string;
};

const STORAGE_KEY = "homeward:auth-intent";

export function setPendingIntent(intent: AuthIntent): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(intent));
  } catch {
    // private mode / quota — ignore
  }
}

export function getPendingIntent(): AuthIntent | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AuthIntent;
    if (!parsed?.type || !parsed?.returnTo) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function clearPendingIntent(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

/** Copy shown above the form for each intent. */
export function intentBenefitCopy(type: AuthIntentType): string {
  switch (type) {
    case "like":
      return "Sign in to like this animal and keep track of favourites.";
    case "contact":
      return "Sign in to message the shelter about this animal.";
    case "save":
      return "Sign in to save animals and searches for later.";
    case "comment":
      return "Sign in to leave a comment.";
    default:
      return "Sign in with a magic link — no password needed.";
  }
}
