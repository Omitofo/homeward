import { mockPostsRepository } from "./repository.mock";
import type { PostsRepository } from "./repository";

const useMock = process.env.NEXT_PUBLIC_USE_MOCK_DATA !== "false";

/** Active posts repository. Swap to Supabase implementation in Phase 3. */
export const postsRepository: PostsRepository = useMock
  ? mockPostsRepository
  : mockPostsRepository; // placeholder until supabase impl exists

export type { PostsRepository, ListPostsParams } from "./repository";
