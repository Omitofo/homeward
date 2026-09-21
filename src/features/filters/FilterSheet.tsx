"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { ParsedFeedFilters } from "./schema";
import { filtersToSearchParams } from "./schema";
import { Button, Chip, Input, Sheet } from "@/components/ui";

const SPECIES = [
  { value: "dog", label: "Dogs" },
  { value: "cat", label: "Cats" },
  { value: "rabbit", label: "Rabbits" },
  { value: "bird", label: "Birds" },
  { value: "other", label: "Other" },
] as const;

const SIZES = [
  { value: "small", label: "Small" },
  { value: "medium", label: "Medium" },
  { value: "large", label: "Large" },
  { value: "xl", label: "XL" },
] as const;

const AGE_GROUPS = [
  { value: "baby", label: "Baby" },
  { value: "young", label: "Young" },
  { value: "adult", label: "Adult" },
  { value: "senior", label: "Senior" },
] as const;

const SEXES = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "unknown", label: "Unknown" },
] as const;

type Draft = {
  q: string;
  species: string[];
  size: string[];
  ageGroup: string[];
  sex: string[];
  verified: boolean;
};

function fromFilters(filters: ParsedFeedFilters): Draft {
  return {
    q: filters.q ?? "",
    species: [...(filters.species ?? [])],
    size: [...(filters.size ?? [])],
    ageGroup: [...(filters.ageGroup ?? [])],
    sex: [...(filters.sex ?? [])],
    verified: Boolean(filters.verified),
  };
}

function toParsed(draft: Draft): ParsedFeedFilters {
  const next: ParsedFeedFilters = {};
  const q = draft.q.trim();
  if (q) next.q = q;
  if (draft.species.length) next.species = draft.species as ParsedFeedFilters["species"];
  if (draft.size.length) next.size = draft.size as ParsedFeedFilters["size"];
  if (draft.ageGroup.length) next.ageGroup = draft.ageGroup as ParsedFeedFilters["ageGroup"];
  if (draft.sex.length) next.sex = draft.sex as ParsedFeedFilters["sex"];
  if (draft.verified) next.verified = true;
  return next;
}

function toggleIn(list: string[], value: string): string[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

function activeCount(filters: ParsedFeedFilters): number {
  let n = 0;
  if (filters.q) n += 1;
  if (filters.species?.length) n += filters.species.length;
  if (filters.size?.length) n += filters.size.length;
  if (filters.ageGroup?.length) n += filters.ageGroup.length;
  if (filters.sex?.length) n += filters.sex.length;
  if (filters.verified) n += 1;
  if (filters.country) n += 1;
  if (filters.region) n += 1;
  if (filters.city) n += 1;
  return n;
}

export type FilterSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters: ParsedFeedFilters;
};

export function FilterSheet({ open, onOpenChange, filters }: FilterSheetProps) {
  const router = useRouter();
  const [draft, setDraft] = useState<Draft>(() => fromFilters(filters));

  // Reset draft whenever the sheet opens or URL filters change while open
  useEffect(() => {
    if (open) setDraft(fromFilters(filters));
  }, [open, filters]);

  const draftCount = useMemo(() => activeCount(toParsed(draft)), [draft]);

  const apply = useCallback(() => {
    const parsed = toParsed(draft);
    const sp = filtersToSearchParams(parsed);
    const q = sp.toString();
    router.push(q ? `/explore?${q}` : "/explore", { scroll: false });
    onOpenChange(false);
  }, [draft, router, onOpenChange]);

  const clear = useCallback(() => {
    setDraft({
      q: "",
      species: [],
      size: [],
      ageGroup: [],
      sex: [],
      verified: false,
    });
  }, []);

  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
      title="Filters"
      footer={
        <div className="flex gap-2">
          <Button variant="secondary" className="flex-1" onClick={clear}>
            Clear
          </Button>
          <Button className="flex-1" onClick={apply}>
            Show results{draftCount > 0 ? ` (${draftCount})` : ""}
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        <Input
          label="Search"
          name="q"
          placeholder="Name, breed, city…"
          value={draft.q}
          onChange={(e) => setDraft((d) => ({ ...d, q: e.target.value }))}
          autoComplete="off"
        />

        <section className="space-y-2">
          <h3 className="text-sm font-medium text-foreground">Species</h3>
          <div className="flex flex-wrap gap-2">
            {SPECIES.map((s) => (
              <Chip
                key={s.value}
                selected={draft.species.includes(s.value)}
                onClick={() =>
                  setDraft((d) => ({
                    ...d,
                    species: toggleIn(d.species, s.value),
                  }))
                }
              >
                {s.label}
              </Chip>
            ))}
          </div>
        </section>

        <section className="space-y-2">
          <h3 className="text-sm font-medium text-foreground">Size</h3>
          <div className="flex flex-wrap gap-2">
            {SIZES.map((s) => (
              <Chip
                key={s.value}
                selected={draft.size.includes(s.value)}
                onClick={() =>
                  setDraft((d) => ({
                    ...d,
                    size: toggleIn(d.size, s.value),
                  }))
                }
              >
                {s.label}
              </Chip>
            ))}
          </div>
        </section>

        <section className="space-y-2">
          <h3 className="text-sm font-medium text-foreground">Age</h3>
          <div className="flex flex-wrap gap-2">
            {AGE_GROUPS.map((s) => (
              <Chip
                key={s.value}
                selected={draft.ageGroup.includes(s.value)}
                onClick={() =>
                  setDraft((d) => ({
                    ...d,
                    ageGroup: toggleIn(d.ageGroup, s.value),
                  }))
                }
              >
                {s.label}
              </Chip>
            ))}
          </div>
        </section>

        <section className="space-y-2">
          <h3 className="text-sm font-medium text-foreground">Sex</h3>
          <div className="flex flex-wrap gap-2">
            {SEXES.map((s) => (
              <Chip
                key={s.value}
                selected={draft.sex.includes(s.value)}
                onClick={() =>
                  setDraft((d) => ({
                    ...d,
                    sex: toggleIn(d.sex, s.value),
                  }))
                }
              >
                {s.label}
              </Chip>
            ))}
          </div>
        </section>

        <section className="space-y-2">
          <h3 className="text-sm font-medium text-foreground">Shelter</h3>
          <div className="flex flex-wrap gap-2">
            <Chip
              selected={draft.verified}
              onClick={() => setDraft((d) => ({ ...d, verified: !d.verified }))}
            >
              Verified only
            </Chip>
          </div>
        </section>
      </div>
    </Sheet>
  );
}

export function countActiveFilters(filters: ParsedFeedFilters): number {
  return activeCount(filters);
}
