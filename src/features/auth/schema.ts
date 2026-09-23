import { z } from "zod";

/** Email used for magic-link and password auth. */
export const emailSchema = z
  .string()
  .trim()
  .email("Enter a valid email address")
  .max(254);

/** Display name stored on the profile row. */
export const displayNameSchema = z
  .string()
  .trim()
  .min(1, "Name is required")
  .max(80, "Name must be 80 characters or fewer");

/** Shelter handle: lowercase slug, 3–32 chars. */
export const handleSchema = z
  .string()
  .trim()
  .toLowerCase()
  .regex(
    /^[a-z0-9]([a-z0-9-]{1,30}[a-z0-9])?$/,
    "Handle must be 3–32 characters: letters, numbers, hyphens",
  );

export const orgNameSchema = z
  .string()
  .trim()
  .min(1, "Organization name is required")
  .max(120, "Organization name must be 120 characters or fewer");

/** Password for email+password auth (Supabase default min is 6; we use 8). */
export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(72, "Password must be 72 characters or fewer");

export const magicLinkAdopterSchema = z.object({
  email: emailSchema,
  displayName: displayNameSchema,
  next: z.string().optional(),
});

export const magicLinkShelterSchema = z.object({
  email: emailSchema,
  displayName: displayNameSchema,
  orgName: orgNameSchema,
  handle: handleSchema,
  next: z.string().optional(),
});

export const magicLinkSignInSchema = z.object({
  email: emailSchema,
  next: z.string().optional(),
});

export const passwordSignInSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  next: z.string().optional(),
});

export const passwordAdopterSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  displayName: displayNameSchema,
  next: z.string().optional(),
});

export const passwordShelterSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  displayName: displayNameSchema,
  orgName: orgNameSchema,
  handle: handleSchema,
  next: z.string().optional(),
});

export type MagicLinkAdopterInput = z.infer<typeof magicLinkAdopterSchema>;
export type MagicLinkShelterInput = z.infer<typeof magicLinkShelterSchema>;
export type MagicLinkSignInInput = z.infer<typeof magicLinkSignInSchema>;
export type PasswordSignInInput = z.infer<typeof passwordSignInSchema>;
export type PasswordAdopterInput = z.infer<typeof passwordAdopterSchema>;
export type PasswordShelterInput = z.infer<typeof passwordShelterSchema>;
