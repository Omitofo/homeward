import type { AnimalPost, CursorPage, FeedFilters } from "@/types/domain";

export type ListPostsParams = {
  filters?: FeedFilters;
  cursor?: string | null;
  limit?: number;
};

export interface PostsRepository {
  list(params?: ListPostsParams): Promise<CursorPage<AnimalPost>>;
  getById(id: string): Promise<AnimalPost | null>;
  listByShelter(shelterId: string): Promise<AnimalPost[]>;
}
