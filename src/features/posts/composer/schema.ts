import { z } from "zod";

export const SPECIES = ["dog", "cat", "rabbit", "bird", "other"] as const;
export const SEX = ["male", "female", "unknown"] as const;
export const AGE_GROUP = ["baby", "young", "adult", "senior"] as const;
export const SIZE = ["small", "medium", "large", "xl"] as const;
export const POST_STATUS = ["available", "reserved", "adopted", "archived"] as const;

/** Common trait chips for the composer. */
export const TRAIT_OPTIONS = [
  "vaccinated",
  "neutered",
  "kids-friendly",
  "dogs-friendly",
  "cats-friendly",
  "apartment-ok",
  "high-energy",
  "low-energy",
  "indoor",
  "leash-trained",
  "crate-trained",
  "litter-trained",
  "senior",
  "playful",
  "cuddly",
  "shy",
  "trainable",
  "hypoallergenic",
  "bonded-pair",
] as const;

export const mediaItemSchema = z.object({
  storagePath: z.string().min(1),
  publicUrl: z.string().min(1),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  altText: z.string().max(200).default(""),
  /** Existing media id when editing; omit for newly uploaded. */
  id: z.string().optional(),
});

export const postComposerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .max(80, "Name must be 80 characters or fewer"),
  species: z.enum(SPECIES, { message: "Pick a species" }),
  breed: z.string().trim().max(80).default(""),
  sex: z.enum(SEX).default("unknown"),
  ageMonths: z.coerce
    .number()
    .int()
    .min(0, "Age cannot be negative")
    .max(360, "Age looks unrealistic"),
  ageGroup: z.enum(AGE_GROUP, { message: "Pick an age group" }),
  size: z.enum(SIZE, { message: "Pick a size" }),
  description: z
    .string()
    .trim()
    .min(20, "Add a short description (at least 20 characters)")
    .max(5000, "Description is too long"),
  countryCode: z
    .string()
    .trim()
    .length(2, "Use a 2-letter country code")
    .transform((s) => s.toUpperCase()),
  region: z.string().trim().max(80).default(""),
  city: z.string().trim().max(80).default(""),
  status: z.enum(POST_STATUS).default("available"),
  traits: z.array(z.string().min(1).max(40)).max(20).default([]),
  media: z
    .array(mediaItemSchema)
    .min(1, "Add at least one photo")
    .max(10, "Maximum 10 photos"),
});

export type PostComposerInput = z.infer<typeof postComposerSchema>;
export type MediaItemInput = z.infer<typeof mediaItemSchema>;
