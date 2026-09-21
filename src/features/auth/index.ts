export { getCurrentProfile, isAuthenticated } from "./session";
export {
  signInWithMagicLink,
  signUpAdopter,
  signUpShelter,
  signOut,
  ensureShelterProfile,
} from "./actions";
export { MagicLinkForm } from "./components/MagicLinkForm";
export { SignOutButton } from "./components/SignOutButton";
export type { AuthProfile, ActionResult } from "./types";
