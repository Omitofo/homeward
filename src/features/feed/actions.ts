"use server";

import { postsRepository } from "@/features/posts";
import type { AnimalPost, FeedFilters } from "@/types/domain";

export type LoadMoreResult = {
  items: AnimalPost[];
  nextCursor: string | null;
};

export async function loadMorePosts(params: {
  filters?: FeedFilters;
  cursor: string;
  limit?: number;
}): Promise<LoadMoreResult> {
  const { items, nextCursor } = await postsRepository.list({
    filters: params.filters,
    cursor: params.cursor,
    limit: params.limit ?? 12,
  });
  return { items, nextCursor };
}
