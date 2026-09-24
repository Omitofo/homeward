"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { AnimalPost } from "@/types/domain";
import { PostCard } from "@/features/feed/PostCard";
import { hasLocalSave, readLocalSaves } from "./local-store";

type Props = {
  initial: AnimalPost[];
  userId: string;
  /** All posts available in mock mode so we can resolve localStorage ids */
  mockCandidates?: AnimalPost[];
  emptyHint?: string;
};

/**
 * Server-rendered saved list + optional mock-mode merge from localStorage.
 * In real mode `initial` is authoritative.
 */
export function SavedAnimalsGrid({
  initial,
  userId,
  mockCandidates = [],
  emptyHint = "No saved animals yet. Open a post and tap Save.",
}: Props) {
  const [items, setItems] = useState<AnimalPost[]>(initial);

  useEffect(() => {
    if (mockCandidates.length === 0) return;
    const localIds = readLocalSaves(userId);
    if (localIds.size === 0) return;

    setItems((prev) => {
      const byId = new Map(prev.map((p) => [p.id, p]));
      for (const id of localIds) {
        if (byId.has(id)) continue;
        const found = mockCandidates.find((p) => p.id === id);
        if (found) byId.set(id, found);
      }
      // Keep local-only order roughly: newest local first is not tracked; append
      return Array.from(byId.values());
    });
  }, [userId, mockCandidates]);

  if (items.length === 0) {
    return (
      <p className="text-sm text-muted">
        {emptyHint}{" "}
        <Link href="/explore" className="font-medium text-primary hover:underline">
          Explore
        </Link>
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {items.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}

/** Re-export helper for liked mock hydration if needed later */
export function filterLocalSaved(
  userId: string,
  candidates: AnimalPost[],
): AnimalPost[] {
  return candidates.filter((p) => hasLocalSave(userId, p.id));
}
