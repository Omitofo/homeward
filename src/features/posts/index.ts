import { mockPostsRepository } from "./repository.mock";
import { supabasePostsRepository } from "./repository.supabase";
import type { PostsRepository } from "./repository";

const useMock = process.env.NEXT_PUBLIC_USE_MOCK_DATA !== "false";

/** Active posts repository. Swap to Supabase when USE_MOCK_DATA=false. */
export const postsRepository: PostsRepository = useMock
  ? mockPostsRepository
  : supabasePostsRepository;

export type { PostsRepository, ListPostsParams } from "./repository";
export { uploadAnimalImage, type UploadedMedia } from "./upload/actions";
