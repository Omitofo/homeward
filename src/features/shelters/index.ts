import { mockSheltersRepository } from "./repository.mock";
import type { SheltersRepository } from "./repository";

const useMock = process.env.NEXT_PUBLIC_USE_MOCK_DATA !== "false";

/** Active shelters repository. Swap to Supabase implementation in Phase 3. */
export const sheltersRepository: SheltersRepository = useMock
  ? mockSheltersRepository
  : mockSheltersRepository;

export type { SheltersRepository } from "./repository";
