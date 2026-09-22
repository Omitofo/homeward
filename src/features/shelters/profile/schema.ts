import { z } from "zod";

const linkSchema = z.object({
  label: z
    .string()
    .trim()
    .min(1, "Link label required")
    .max(40, "Label too long"),
  url: z
    .string()
    .trim()
    .url("Must be a valid URL")
    .refine(
      (u) => u.startsWith("https://") || u.startsWith("http://"),
      "URL must start with http:// or https://",
    )
    .refine((u) => u.length <= 500, "URL too long"),
});

export const shelterProfileSchema = z.object({
  orgName: z
    .string()
    .trim()
    .min(1, "Organization name is required")
    .max(120, "Name must be 120 characters or fewer"),
  bio: z.string().trim().max(2000, "Bio must be 2000 characters or fewer").default(""),
  countryCode: z
    .string()
    .trim()
    .length(2, "Use a 2-letter country code")
    .transform((s) => s.toUpperCase()),
  region: z.string().trim().max(80).default(""),
  city: z.string().trim().max(80).default(""),
  links: z.array(linkSchema).max(8, "Maximum 8 links").default([]),
  /** Public avatar URL after upload (or existing). Empty string clears. */
  avatarUrl: z.string().trim().max(1000).nullable().optional(),
});

export type ShelterProfileInput = z.infer<typeof shelterProfileSchema>;
export type ShelterLinkInput = z.infer<typeof linkSchema>;
