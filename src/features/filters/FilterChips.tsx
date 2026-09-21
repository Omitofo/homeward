import Link from "next/link";
import type { ParsedFeedFilters } from "./schema";
import { filtersToSearchParams } from "./schema";
import { Chip } from "@/components/ui";

const SPECIES = [
  { value: "dog", label: "Dogs" },
  { value: "cat", label: "Cats" },
  { value: "rabbit", label: "Rabbits" },
  { value: "bird", label: "Birds" },
  { value: "other", label: "Other" },
] as const;

function toggleSpecies(current: ParsedFeedFilters, value: string): string {
  const set = new Set(current.species ?? []);
  if (set.has(value as never)) set.delete(value as never);
  else set.add(value as never);
  const next: ParsedFeedFilters = {
    ...current,
    species: set.size ? ([...set] as ParsedFeedFilters["species"]) : undefined,
  };
  const sp = filtersToSearchParams(next);
  const q = sp.toString();
  return q ? `/explore?${q}` : "/explore";
}

function toggleVerified(current: ParsedFeedFilters): string {
  const next: ParsedFeedFilters = {
    ...current,
    verified: current.verified ? undefined : true,
  };
  // clear the verified flag properly
  if (current.verified) {
    const { verified: _, ...rest } = current;
    const sp = filtersToSearchParams(rest);
    const q = sp.toString();
    return q ? `/explore?${q}` : "/explore";
  }
  const sp = filtersToSearchParams(next);
  return `/explore?${sp.toString()}`;
}

export function FilterChips({ filters }: { filters: ParsedFeedFilters }) {
  const hasAny =
    Boolean(filters.species?.length) ||
    Boolean(filters.verified) ||
    Boolean(filters.q) ||
    Boolean(filters.country);

  return (
    <div className="flex flex-wrap items-center gap-2">
      {SPECIES.map((s) => {
        const selected = filters.species?.includes(s.value) ?? false;
        return (
          <Link key={s.value} href={toggleSpecies(filters, s.value)} scroll={false}>
            <Chip selected={selected}>{s.label}</Chip>
          </Link>
        );
      })}
      <Link href={toggleVerified(filters)} scroll={false}>
        <Chip selected={Boolean(filters.verified)}>Verified only</Chip>
      </Link>
      {hasAny && (
        <Link href="/explore" scroll={false} className="text-sm text-muted underline-offset-2 hover:underline">
          Clear all
        </Link>
      )}
    </div>
  );
}
