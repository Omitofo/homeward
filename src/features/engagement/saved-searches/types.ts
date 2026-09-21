import type { ParsedFeedFilters } from "@/features/filters/schema";

export type SavedSearch = {
  id: string;
  name: string;
  filters: ParsedFeedFilters;
  notify: boolean;
  createdAt: string;
};
