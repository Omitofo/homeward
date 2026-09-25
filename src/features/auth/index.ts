export { getCurrentProfile, isAuthenticated } from "./session";
export {
  signInWithMagicLink,
  signInWithPassword,
  signUpAdopter,
  signUpAdopterWithPassword,
  signUpShelter,
  signUpShelterWithPassword,
  signOut,
} from "./actions";
export { exportAccountData, deleteAccount } from "./account-actions";
export { AccountPrivacy } from "./AccountPrivacy";
export {
  submitShelterApplication,
  ensureShelterProfile,
} from "./promote-shelter";
export { MagicLinkForm } from "./components/MagicLinkForm";
export { SignOutButton } from "./components/SignOutButton";
export { AuthSheet } from "./components/AuthSheet";
export { IntentResume } from "./components/IntentResume";
export {
  setPendingIntent,
  getPendingIntent,
  clearPendingIntent,
  intentBenefitCopy,
  type AuthIntent,
  type AuthIntentType,
} from "./intent";
export type { AuthProfile, ActionResult } from "./types";
