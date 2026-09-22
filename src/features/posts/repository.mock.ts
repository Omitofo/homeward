import { mockAnimals } from "@/data/mock/animals";
import type { AnimalPost, CursorPage, FeedFilters } from "@/types/domain";
import type { ListPostsParams, PostsRepository } from "./repository";
import {
  getMockCreatedById,
  getMockCreatedPosts,
  listMockCreatedByShelter,
} from "./composer/mock-store";

function matchesFilters(post: AnimalPost, filters?: FeedFilters): boolean {
  if (!filters) return post.status !== "archived";

  if (post.status === "archived") return false;

  if (filters.status?.length && !filters.status.includes(post.status)) return false;
  // Default: show available + reserved (not adopted) unless status filter set
  if (!filters.status?.length && post.status === "adopted") return false;

  if (filters.species?.length && !filters.species.includes(post.species)) return false;
  if (filters.size?.length && !filters.size.includes(post.size)) return false;
  if (filters.ageGroup?.length && !filters.ageGroup.includes(post.ageGroup)) return false;
  if (filters.sex?.length && !filters.sex.includes(post.sex)) return false;
  if (filters.countryCode && post.countryCode !== filters.countryCode) return false;
  if (filters.region && !post.region.toLowerCase().includes(filters.region.toLowerCase()))
    return false;
  if (filters.city && !post.city.toLowerCase().includes(filters.city.toLowerCase())) return false;
  if (filters.verifiedOnly && post.shelter.verificationStatus !== "verified") return false;
  if (filters.traits?.length) {
    const hasAll = filters.traits.every((t) => post.traits.includes(t));
    if (!hasAll) return false;
  }
  if (filters.q) {
    const q = filters.q.toLowerCase();
    const hay = `${post.name} ${post.breed} ${post.description} ${post.shelter.orgName}`.toLowerCase();
    if (!hay.includes(q)) return false;
  }

  return true;
}

function sortByNewest(a: AnimalPost, b: AnimalPost) {
  return b.createdAt.localeCompare(a.createdAt) || b.id.localeCompare(a.id);
}

function allPosts(): AnimalPost[] {
  const created = getMockCreatedPosts();
  // Created posts override seed by id if ever colliding
  const ids = new Set(created.map((p) => p.id));
  return [...created, ...mockAnimals.filter((p) => !ids.has(p.id))];
}

export const mockPostsRepository: PostsRepository = {
  async list({ filters, cursor, limit = 12 }: ListPostsParams = {}): Promise<CursorPage<AnimalPost>> {
    const filtered = allPosts().filter((p) => matchesFilters(p, filters)).sort(sortByNewest);

    let start = 0;
    if (cursor) {
      const idx = filtered.findIndex((p) => p.id === cursor);
      start = idx >= 0 ? idx + 1 : 0;
    }

    const slice = filtered.slice(start, start + limit);
    const nextCursor = start + limit < filtered.length ? (slice[slice.length - 1]?.id ?? null) : null;

    return { items: slice, nextCursor };
  },

  async getById(id: string): Promise<AnimalPost | null> {
    return getMockCreatedById(id) ?? mockAnimals.find((p) => p.id === id) ?? null;
  },

  async listByShelter(shelterId: string): Promise<AnimalPost[]> {
    const created = listMockCreatedByShelter(shelterId);
    const seeded = mockAnimals.filter(
      (p) => p.shelter.id === shelterId && p.status !== "archived",
    );
    const ids = new Set(created.map((p) => p.id));
    return [...created, ...seeded.filter((p) => !ids.has(p.id))].sort(sortByNewest);
  },
};
