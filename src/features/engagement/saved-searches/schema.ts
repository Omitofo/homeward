import { z } from "zod";
import { feedFiltersSchema } from "@/features/filters/schema";

export const saveSearchSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Give this search a name")
    .max(80, "Name must be 80 characters or fewer"),
  filters: feedFiltersSchema,
  notify: z.boolean().optional().default(false),
});

export type SaveSearchInput = z.infer<typeof saveSearchSchema>;
