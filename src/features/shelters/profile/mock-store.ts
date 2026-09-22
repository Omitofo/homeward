import type { Shelter } from "@/types/domain";

/**
 * In-memory shelter profile overrides for mock mode.
 * Keyed by shelter id. Survives the Node process (dev server).
 */
const overrides = new Map<string, Shelter>();

export function setMockShelterOverride(shelter: Shelter): void {
  overrides.set(shelter.id, shelter);
}

export function getMockShelterOverride(id: string): Shelter | null {
  return overrides.get(id) ?? null;
}

export function clearMockShelterOverride(id: string): void {
  overrides.delete(id);
}
