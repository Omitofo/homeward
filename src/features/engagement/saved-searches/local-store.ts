import type { SavedSearch } from "./types";

const PREFIX = "homeward:saved-searches:";

function key(userId: string) {
  return `${PREFIX}${userId}`;
}

export function readLocalSavedSearches(userId: string): SavedSearch[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(key(userId));
    if (!raw) return [];
    const arr = JSON.parse(raw) as SavedSearch[];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

export function writeLocalSavedSearches(
  userId: string,
  items: SavedSearch[],
): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key(userId), JSON.stringify(items));
  } catch {
    // private mode / quota
  }
}

export function appendLocalSavedSearch(
  userId: string,
  item: SavedSearch,
): SavedSearch[] {
  const next = [item, ...readLocalSavedSearches(userId)];
  writeLocalSavedSearches(userId, next);
  return next;
}

export function removeLocalSavedSearch(
  userId: string,
  id: string,
): SavedSearch[] {
  const next = readLocalSavedSearches(userId).filter((s) => s.id !== id);
  writeLocalSavedSearches(userId, next);
  return next;
}
