"use client";

import { useState } from "react";
import type { ParsedFeedFilters } from "./schema";
import { FilterChips } from "./FilterChips";
import { FilterSheet, countActiveFilters } from "./FilterSheet";
import { Button } from "@/components/ui";
import { SaveSearchButton } from "@/features/engagement";

type Props = {
  filters: ParsedFeedFilters;
  signedIn?: boolean;
  userId?: string | null;
  canSaveSearch?: boolean;
};

export function FilterBar({
  filters,
  signedIn = false,
  userId,
  canSaveSearch = true,
}: Props) {
  const [open, setOpen] = useState(false);
  const count = countActiveFilters(filters);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <FilterChips filters={filters} />
        <div className="flex shrink-0 items-center gap-2">
          <SaveSearchButton
            filters={filters}
            signedIn={signedIn}
            userId={userId}
            canSave={canSaveSearch}
          />
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setOpen(true)}
            aria-expanded={open}
            aria-haspopup="dialog"
            aria-label={
              count > 0 ? `Filters, ${count} active` : "Open filters"
            }
          >
            Filters{count > 0 ? ` · ${count}` : ""}
          </Button>
        </div>
      </div>
      <FilterSheet open={open} onOpenChange={setOpen} filters={filters} />
    </div>
  );
}
