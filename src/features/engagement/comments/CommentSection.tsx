"use client";

import { useEffect, useState, useTransition, type FormEvent } from "react";
import { usePathname } from "next/navigation";
import { Avatar, Button } from "@/components/ui";
import { AuthSheet } from "@/features/auth/components/AuthSheet";
import type { AuthIntent } from "@/features/auth/intent";
import { ReportButton } from "@/features/moderation";
import { addComment, deleteComment } from "./actions";
import {
  appendLocalComment,
  readLocalComments,
  removeLocalComment,
} from "./local-store";
import type { CommentItem } from "./types";

type Props = {
  postId: string;
  initialComments: CommentItem[];
  initialCount: number;
  signedIn: boolean;
  userId?: string | null;
  displayName?: string | null;
};

function formatWhen(iso: string) {
  try {
    return new Date(iso).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

export function CommentSection({
  postId,
  initialComments,
  initialCount,
  signedIn,
  userId,
}: Props) {
  const pathname = usePathname();
  const [comments, setComments] = useState<CommentItem[]>(initialComments);
  const [count, setCount] = useState(initialCount);
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [intent, setIntent] = useState<AuthIntent | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    const local = readLocalComments(postId);
    if (local.length === 0) return;
    setComments((prev) => {
      const ids = new Set(prev.map((c) => c.id));
      const merged = [...prev];
      for (const c of local) {
        if (!ids.has(c.id)) merged.push(c);
      }
      merged.sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      );
      return merged;
    });
    setCount((c) => Math.max(c, initialCount, local.length));
  }, [postId, initialCount]);

  function openAuth() {
    setIntent({
      type: "comment",
      returnTo: pathname || `/post/${postId}`,
      postId,
    });
    setSheetOpen(true);
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!signedIn) {
      openAuth();
      return;
    }

    const trimmed = body.trim();
    if (!trimmed) {
      setError("Write something first");
      return;
    }

    startTransition(async () => {
      const result = await addComment({ postId, body: trimmed });
      if (!result.ok) {
        setError(result.error);
        return;
      }

      const { comment, mock } = result.data;
      if (mock) {
        appendLocalComment(postId, comment);
      }
      setComments((prev) => [...prev, comment]);
      setCount((c) => c + 1);
      setBody("");
    });
  }

  function onDelete(commentId: string) {
    startTransition(async () => {
      const result = await deleteComment(commentId, postId);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      removeLocalComment(postId, commentId);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
      setCount((c) => Math.max(0, c - 1));
    });
  }

  return (
    <section className="space-y-4" aria-labelledby="comments-heading">
      <h2
        id="comments-heading"
        className="text-sm font-semibold uppercase tracking-wide text-muted"
      >
        Comments · {count}
      </h2>

      <ul className="space-y-4">
        {comments.length === 0 && (
          <li className="text-sm text-muted">No comments yet. Be the first.</li>
        )}
        {comments.map((c) => (
          <li key={c.id} className="flex gap-3">
            <Avatar name={c.displayName} size="sm" />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                <span className="text-sm font-medium text-foreground">
                  {c.displayName}
                </span>
                <time className="text-xs text-muted" dateTime={c.createdAt}>
                  {formatWhen(c.createdAt)}
                </time>
              </div>
              <p className="mt-0.5 whitespace-pre-wrap text-sm text-foreground">
                {c.body}
              </p>
              <div className="mt-1 flex flex-wrap gap-3">
                {signedIn && userId === c.userId ? (
                  <button
                    type="button"
                    className="text-xs text-muted hover:text-danger"
                    disabled={pending}
                    onClick={() => onDelete(c.id)}
                  >
                    Delete
                  </button>
                ) : null}
                {userId !== c.userId ? (
                  <ReportButton
                    targetType="comment"
                    targetId={c.id}
                    signedIn={signedIn}
                    returnTo={pathname || `/post/${postId}`}
                  />
                ) : null}
              </div>
            </div>
          </li>
        ))}
      </ul>

      <form onSubmit={onSubmit} className="space-y-2">
        <label htmlFor="comment-body" className="sr-only">
          Add a comment
        </label>
        <textarea
          id="comment-body"
          name="body"
          rows={3}
          maxLength={1000}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          onFocus={() => {
            if (!signedIn) openAuth();
          }}
          placeholder={signedIn ? "Write a comment…" : "Sign in to comment"}
          className="w-full resize-y rounded-md border border-input bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs text-muted">{body.length}/1000</span>
          <Button type="submit" size="sm" disabled={pending || !body.trim()}>
            {pending ? "Posting…" : signedIn ? "Post comment" : "Sign in to post"}
          </Button>
        </div>
        {error && (
          <p className="text-sm text-danger" role="alert">
            {error}
          </p>
        )}
      </form>

      <AuthSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        intent={intent}
        next={pathname || `/post/${postId}`}
      />
    </section>
  );
}
