import type { AnimalPost } from "@/types/domain";

/**
 * In-memory posts created via the composer while mock mode is on.
 * Survives for the Node process lifetime (dev server). Merged into
 * mock listByShelter / getById so studio sees new posts without DB.
 */
const created: AnimalPost[] = [];

export function addMockPost(post: AnimalPost): void {
  const idx = created.findIndex((p) => p.id === post.id);
  if (idx >= 0) created[idx] = post;
  else created.unshift(post);
}

export function getMockCreatedPosts(): AnimalPost[] {
  return created.slice();
}

export function getMockCreatedById(id: string): AnimalPost | null {
  return created.find((p) => p.id === id) ?? null;
}

export function listMockCreatedByShelter(shelterId: string): AnimalPost[] {
  return created.filter(
    (p) => p.shelter.id === shelterId && p.status !== "archived",
  );
}
