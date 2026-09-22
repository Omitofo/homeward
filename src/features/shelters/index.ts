import { mockSheltersRepository } from "./repository.mock";
import { supabaseSheltersRepository } from "./repository.supabase";
import type { SheltersRepository } from "./repository";

const useMock = process.env.NEXT_PUBLIC_USE_MOCK_DATA !== "false";

/** Active shelters repository. Swap to Supabase when USE_MOCK_DATA=false. */
export const sheltersRepository: SheltersRepository = useMock
  ? mockSheltersRepository
  : supabaseSheltersRepository;

export type { SheltersRepository } from "./repository";
export { getShelterForProfile } from "./get-for-profile";
export {
  ProfileEditor,
  updateShelterProfile,
  shelterProfileSchema,
} from "./profile";
