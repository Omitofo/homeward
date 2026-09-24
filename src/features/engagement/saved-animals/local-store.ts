/**
 * Client-side save memory for mock-mode posts (non-UUID ids).
 * Keyed by user id so different accounts on the same browser stay separate.
 */

const PREFIX = "homeward:saves:";

function key(userId: string) {
  return `${PREFIX}${userId}`;
}

export function readLocalSaves(userId: string): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(key(userId));
    if (!raw) return new Set();
    const arr = JSON.parse(raw) as string[];
    return new Set(Array.isArray(arr) ? arr : []);
  } catch {
    return new Set();
  }
}

export function writeLocalSave(
  userId: string,
  postId: string,
  saved: boolean,
): void {
  if (typeof window === "undefined") return;
  try {
    const set = readLocalSaves(userId);
    if (saved) set.add(postId);
    else set.delete(postId);
    localStorage.setItem(key(userId), JSON.stringify([...set]));
  } catch {
    // private mode / quota
  }
}

export function hasLocalSave(userId: string, postId: string): boolean {
  return readLocalSaves(userId).has(postId);
}
