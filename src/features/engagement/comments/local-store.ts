import type { CommentItem } from "./types";

const PREFIX = "homeward:comments:";

function key(postId: string) {
  return `${PREFIX}${postId}`;
}

export function readLocalComments(postId: string): CommentItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(key(postId));
    if (!raw) return [];
    const arr = JSON.parse(raw) as CommentItem[];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

export function writeLocalComments(postId: string, items: CommentItem[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key(postId), JSON.stringify(items));
  } catch {
    // private mode / quota
  }
}

export function appendLocalComment(
  postId: string,
  item: CommentItem,
): CommentItem[] {
  const next = [...readLocalComments(postId), item];
  writeLocalComments(postId, next);
  return next;
}

export function removeLocalComment(
  postId: string,
  commentId: string,
): CommentItem[] {
  const next = readLocalComments(postId).filter((c) => c.id !== commentId);
  writeLocalComments(postId, next);
  return next;
}
