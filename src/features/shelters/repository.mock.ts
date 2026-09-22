import { mockShelters } from "@/data/mock/shelters";
import type { Shelter } from "@/types/domain";
import type { SheltersRepository } from "./repository";
import { getMockShelterOverride } from "./profile/mock-store";

function resolve(s: Shelter): Shelter {
  return getMockShelterOverride(s.id) ?? s;
}

export const mockSheltersRepository: SheltersRepository = {
  async list(): Promise<Shelter[]> {
    return mockShelters.map(resolve);
  },

  async getById(id: string): Promise<Shelter | null> {
    const base = mockShelters.find((s) => s.id === id);
    if (!base) return getMockShelterOverride(id);
    return resolve(base);
  },

  async getByHandle(handle: string): Promise<Shelter | null> {
    const base = mockShelters.find((s) => s.handle === handle);
    if (!base) return null;
    return resolve(base);
  },
};
