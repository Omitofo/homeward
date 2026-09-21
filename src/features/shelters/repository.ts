import type { Shelter } from "@/types/domain";

export interface SheltersRepository {
  list(): Promise<Shelter[]>;
  getById(id: string): Promise<Shelter | null>;
  getByHandle(handle: string): Promise<Shelter | null>;
}
