export { getCurrentProfile, isAuthenticated } from "./session";
export {
  signInWithMagicLink,
  signUpAdopter,
  signUpShelter,
  signOut,
} from "./actions";
export { ensureShelterProfile } from "./promote-shelter";
export { MagicLinkForm } from "./components/MagicLinkForm";
export { SignOutButton } from "./components/SignOutButton";
export type { AuthProfile, ActionResult } from "./types";
