import { mockShelters } from "@/data/mock/shelters";
import type { Shelter } from "@/types/domain";
import type { SheltersRepository } from "./repository";

export const mockSheltersRepository: SheltersRepository = {
  async list(): Promise<Shelter[]> {
    return [...mockShelters];
  },

  async getById(id: string): Promise<Shelter | null> {
    return mockShelters.find((s) => s.id === id) ?? null;
  },

  async getByHandle(handle: string): Promise<Shelter | null> {
    return mockShelters.find((s) => s.handle === handle) ?? null;
  },
};
