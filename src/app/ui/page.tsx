"use client";

import { useState } from "react";
import {
  Avatar,
  Badge,
  Button,
  Chip,
  Input,
  Sheet,
  Skeleton,
  VerifiedBadge,
} from "@/components/ui";

export default function UiPreviewPage() {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [chipOn, setChipOn] = useState(true);

  return (
    <main className="mx-auto max-w-3xl space-y-12 px-6 py-12">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight">UI Primitives</h1>
        <p className="mt-2 text-muted">
          Living samples for the base components (P0-05).
        </p>
      </header>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Button</h2>
        <div className="flex flex-wrap gap-3">
          <Button>Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="danger">Danger</Button>
          <Button size="sm">Small</Button>
          <Button size="lg">Large</Button>
          <Button disabled>Disabled</Button>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Chip</h2>
        <div className="flex flex-wrap gap-2">
          <Chip selected={chipOn} onClick={() => setChipOn((v) => !v)} count={12}>
            Dogs
          </Chip>
          <Chip count={8}>Cats</Chip>
          <Chip>Small</Chip>
          <Chip selected>Selected</Chip>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Badge</h2>
        <div className="flex flex-wrap gap-2">
          <VerifiedBadge />
          <Badge variant="available" withDot>
            Available
          </Badge>
          <Badge variant="reserved" withDot>
            Reserved
          </Badge>
          <Badge variant="adopted" withDot>
            Adopted
          </Badge>
          <Badge>Neutral</Badge>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Avatar</h2>
        <div className="flex items-end gap-4">
          <Avatar name="Luna Shelter" size="sm" />
          <Avatar name="Max Rescue" size="md" />
          <Avatar name="Homeward HQ" size="lg" />
          <Avatar name="Big Org" size="xl" />
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Input</h2>
        <div className="max-w-sm space-y-4">
          <Input label="Email" placeholder="you@example.com" hint="We never share your email." />
          <Input label="Name" placeholder="Required" error="Name is required" />
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Skeleton</h2>
        <div className="flex gap-4">
          <Skeleton className="h-20 w-20 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Sheet</h2>
        <Button variant="secondary" onClick={() => setSheetOpen(true)}>
          Open filters sheet
        </Button>
        <Sheet
          open={sheetOpen}
          onOpenChange={setSheetOpen}
          title="Filters"
          footer={
            <div className="flex gap-2">
              <Button variant="secondary" className="flex-1" onClick={() => setSheetOpen(false)}>
                Clear
              </Button>
              <Button className="flex-1" onClick={() => setSheetOpen(false)}>
                Apply
              </Button>
            </div>
          }
        >
          <p className="text-sm text-muted">
            Bottom sheet example. Escape or backdrop closes. Focus returns to the
            trigger when closed.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Chip selected>Dogs</Chip>
            <Chip>Cats</Chip>
            <Chip>Small</Chip>
          </div>
        </Sheet>
      </section>
    </main>
  );
}
