"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { Button } from "@/components/ui";
import { filtersToSearchParams } from "@/features/filters/schema";
import { deleteSavedSearch } from "./actions";
import {
  readLocalSavedSearches,
  removeLocalSavedSearch,
} from "./local-store";
import type { SavedSearch } from "./types";

type Props = {
  initial: SavedSearch[];
  userId: string;
};

function summary(s: SavedSearch): string {
  const parts: string[] = [];
  if (s.filters.q) parts.push(`“${s.filters.q}”`);
  if (s.filters.species?.length) parts.push(s.filters.species.join(", "));
  if (s.filters.size?.length) parts.push(s.filters.size.join(", "));
  if (s.filters.ageGroup?.length) parts.push(s.filters.ageGroup.join(", "));
  if (s.filters.verified) parts.push("verified");
  if (s.filters.country) parts.push(s.filters.country);
  return parts.length ? parts.join(" · ") : "Custom filters";
}

export function SavedSearchesList({ initial, userId }: Props) {
  const [items, setItems] = useState<SavedSearch[]>(initial);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    const local = readLocalSavedSearches(userId);
    if (local.length === 0) return;
    setItems((prev) => {
      const ids = new Set(prev.map((s) => s.id));
      const merged = [...prev];
      for (const s of local) {
        if (!ids.has(s.id)) merged.push(s);
      }
      merged.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
      return merged;
    });
  }, [userId]);

  function onDelete(id: string) {
    startTransition(async () => {
      const result = await deleteSavedSearch(id);
      if (!result.ok) return;
      removeLocalSavedSearch(userId, id);
      setItems((prev) => prev.filter((s) => s.id !== id));
    });
  }

  if (items.length === 0) {
    return (
      <p className="text-sm text-muted">
        No saved searches yet. Apply filters on{" "}
        <Link href="/explore" className="font-medium text-primary hover:underline">
          Explore
        </Link>{" "}
        and tap <span className="font-medium">Save search</span>.
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {items.map((s) => {
        const qs = filtersToSearchParams(s.filters).toString();
        const href = qs ? `/explore?${qs}` : "/explore";
        return (
          <li
            key={s.id}
            className="flex items-start justify-between gap-3 rounded-lg border border-border bg-card p-3"
          >
            <div className="min-w-0">
              <Link
                href={href}
                className="font-medium text-foreground hover:underline"
              >
                {s.name}
              </Link>
              <p className="mt-0.5 text-xs text-muted">{summary(s)}</p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={pending}
              onClick={() => onDelete(s.id)}
            >
              Delete
            </Button>
          </li>
        );
      })}
    </ul>
  );
}
