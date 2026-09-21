"use client";

import { useState } from "react";
import type { ParsedFeedFilters } from "./schema";
import { FilterChips } from "./FilterChips";
import { FilterSheet, countActiveFilters } from "./FilterSheet";
import { Button } from "@/components/ui";

export function FilterBar({ filters }: { filters: ParsedFeedFilters }) {
  const [open, setOpen] = useState(false);
  const count = countActiveFilters(filters);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <FilterChips filters={filters} />
        <Button
          variant="secondary"
          size="sm"
          className="shrink-0"
          onClick={() => setOpen(true)}
          aria-expanded={open}
        >
          Filters{count > 0 ? ` · ${count}` : ""}
        </Button>
      </div>
      <FilterSheet open={open} onOpenChange={setOpen} filters={filters} />
    </div>
  );
}
