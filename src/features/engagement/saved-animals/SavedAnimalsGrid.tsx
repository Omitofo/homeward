"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { AnimalPost } from "@/types/domain";
import { hasLocalSave, readLocalSaves } from "./local-store";
import { SavedAnimalThumb } from "./SavedAnimalThumb";

type Props = {
  initial: AnimalPost[];
  userId: string;
  mockCandidates?: AnimalPost[];
  emptyHint?: string;
};

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
    <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
      {items.map((post) => (
        <SavedAnimalThumb key={post.id} post={post} />
      ))}
    </div>
  );
}

export function filterLocalSaved(
  userId: string,
  candidates: AnimalPost[],
): AnimalPost[] {
  return candidates.filter((p) => hasLocalSave(userId, p.id));
}
