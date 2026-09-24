"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { AnimalPost } from "@/types/domain";
import { PostCard } from "@/features/feed/PostCard";
import { hasLocalLike, readLocalLikes } from "@/features/engagement/likes/local-store";

type Props = {
  initial: AnimalPost[];
  userId: string;
  mockCandidates?: AnimalPost[];
};

export function LikedAnimalsGrid({
  initial,
  userId,
  mockCandidates = [],
}: Props) {
  const [items, setItems] = useState<AnimalPost[]>(initial);

  useEffect(() => {
    if (mockCandidates.length === 0) return;
    const localIds = readLocalLikes(userId);
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
        No liked animals yet. Open a post and tap Like.{" "}
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

export function filterLocalLiked(
  userId: string,
  candidates: AnimalPost[],
): AnimalPost[] {
  return candidates.filter((p) => hasLocalLike(userId, p.id));
}
