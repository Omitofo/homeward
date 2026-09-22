import { z } from "zod";

export const speciesSchema = z.enum(["dog", "cat", "rabbit", "bird", "other"]);
export const sizeSchema = z.enum(["small", "medium", "large", "xl"]);
export const ageGroupSchema = z.enum(["baby", "young", "adult", "senior"]);
export const sexSchema = z.enum(["male", "female", "unknown"]);
export const statusSchema = z.enum(["available", "reserved", "adopted", "archived"]);

const csv = <T extends z.ZodTypeAny>(item: T) =>
  z
    .string()
    .optional()
    .transform((v) => (v ? v.split(",").filter(Boolean) : undefined))
    .pipe(z.array(item).optional());

/**
 * URL search-params schema for the explore feed.
 * Invalid values are stripped (safe defaults).
 */
export const feedFiltersSchema = z.object({
  q: z.string().trim().max(100).optional(),
  species: csv(speciesSchema).optional(),
  size: csv(sizeSchema).optional(),
  ageGroup: csv(ageGroupSchema).optional(),
  sex: csv(sexSchema).optional(),
  status: csv(statusSchema).optional(),
  country: z.string().trim().length(2).optional(),
  region: z.string().trim().max(80).optional(),
  city: z.string().trim().max(80).optional(),
  // undefined when not in URL; true when present
  verified: z
    .enum(["1", "true", "yes"])
    .optional()
    .transform((v): true | undefined => (v ? true : undefined)),
});

export type FeedFiltersInput = z.input<typeof feedFiltersSchema>;
export type ParsedFeedFilters = z.output<typeof feedFiltersSchema>;

export function parseFeedFilters(
  params: Record<string, string | string[] | undefined>,
): ParsedFeedFilters {
  const flat: Record<string, string | undefined> = {};
  for (const [k, v] of Object.entries(params)) {
    flat[k] = Array.isArray(v) ? v[0] : v;
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
export function filtersToSearchParams(filters: ParsedFeedFilters): URLSearchParams {
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
