import { z } from "zod";

export const speciesSchema = z.enum(["dog", "cat", "rabbit", "bird", "other"]);
export const sizeSchema = z.enum(["small", "medium", "large", "xl"]);
export const ageGroupSchema = z.enum(["baby", "young", "adult", "senior"]);
export const sexSchema = z.enum(["male", "female", "unknown"]);
export const statusSchema = z.enum([
  "available",
  "reserved",
  "adopted",
  "archived",
]);

/**
 * Accept URL CSV strings *or* already-parsed arrays (e.g. from SaveSearchButton).
 * Invalid enum values are dropped by the pipe.
 */
const csvOrArray = <T extends z.ZodTypeAny>(item: T) =>
  z
    .union([z.string(), z.array(z.string())])
    .optional()
    .transform((v) => {
      if (v == null) return undefined;
      const parts = Array.isArray(v) ? v : v.split(",");
      const cleaned = parts.map((s) => s.trim()).filter(Boolean);
      return cleaned.length ? cleaned : undefined;
    })
    .pipe(z.array(item).optional());

/**
 * URL search-params schema for the explore feed.
 * Also used when saving a search with already-parsed filter objects.
 * Invalid values are stripped (safe defaults).
 */
export const feedFiltersSchema = z.object({
  q: z.string().trim().max(100).optional(),
  species: csvOrArray(speciesSchema).optional(),
  size: csvOrArray(sizeSchema).optional(),
  ageGroup: csvOrArray(ageGroupSchema).optional(),
  sex: csvOrArray(sexSchema).optional(),
  status: csvOrArray(statusSchema).optional(),
  country: z.string().trim().length(2).optional(),
  region: z.string().trim().max(80).optional(),
  city: z.string().trim().max(80).optional(),
  // URL: "1" | UI/save: boolean true
  verified: z
    .union([
      z.enum(["1", "true", "yes"]),
      z.literal(true),
      z.literal(false),
    ])
    .optional()
    .transform((v): true | undefined => {
      if (v === true || v === "1" || v === "true" || v === "yes") return true;
      return undefined;
    }),
});

export type FeedFiltersInput = z.input<typeof feedFiltersSchema>;
export type ParsedFeedFilters = z.output<typeof feedFiltersSchema>;

export function parseFeedFilters(
  params: Record<string, string | string[] | undefined>,
): ParsedFeedFilters {
  const flat: Record<string, string | string[] | undefined> = {};
  for (const [k, v] of Object.entries(params)) {
    // Keep arrays as arrays (save-search); collapse multi URL values to first
    if (Array.isArray(v)) {
      flat[k] = v.length > 1 ? v : v[0];
    } else {
      flat[k] = v;
    }
  }
  const result = feedFiltersSchema.safeParse(flat);
  return result.success ? result.data : {};
}

/** Convert parsed filters back to domain FeedFilters for the repository. */
export function toDomainFilters(parsed: ParsedFeedFilters) {
  return {
    q: parsed.q,
    species: parsed.species,
    size: parsed.size,
    ageGroup: parsed.ageGroup,
    sex: parsed.sex,
    status: parsed.status,
    countryCode: parsed.country,
    region: parsed.region,
    city: parsed.city,
    verifiedOnly: parsed.verified || undefined,
  };
}

/** Build a query string from current filters (for chips / clear). */
export function filtersToSearchParams(
  filters: ParsedFeedFilters,
): URLSearchParams {
  const sp = new URLSearchParams();
  if (filters.q) sp.set("q", filters.q);
  if (filters.species?.length) sp.set("species", filters.species.join(","));
  if (filters.size?.length) sp.set("size", filters.size.join(","));
  if (filters.ageGroup?.length) sp.set("ageGroup", filters.ageGroup.join(","));
  if (filters.sex?.length) sp.set("sex", filters.sex.join(","));
  if (filters.status?.length) sp.set("status", filters.status.join(","));
  if (filters.country) sp.set("country", filters.country);
  if (filters.region) sp.set("region", filters.region);
  if (filters.city) sp.set("city", filters.city);
  if (filters.verified) sp.set("verified", "1");
  return sp;
}
