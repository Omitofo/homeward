"use client";

import { useState, useTransition, type FormEvent } from "react";
import { usePathname } from "next/navigation";
import { Button, Input } from "@/components/ui";
import { AuthSheet } from "@/features/auth/components/AuthSheet";
import type { AuthIntent } from "@/features/auth/intent";
import type { ParsedFeedFilters } from "@/features/filters/schema";
import { countActiveFilters } from "@/features/filters/FilterSheet";
import { saveSearch } from "./actions";
import { appendLocalSavedSearch } from "./local-store";

type Props = {
  filters: ParsedFeedFilters;
  signedIn: boolean;
  userId?: string | null;
  canSave?: boolean;
};

export function SaveSearchButton({
  filters,
  signedIn,
  userId,
  canSave = true,
}: Props) {
  const pathname = usePathname();
  const count = countActiveFilters(filters);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [intent, setIntent] = useState<AuthIntent | null>(null);
  const [pending, startTransition] = useTransition();

  if (count === 0) return null;

  function openAuth() {
    setIntent({
      type: "save",
      returnTo: pathname || "/explore",
    });
    setSheetOpen(true);
  }

  function onClickSave() {
    setError(null);
    setDone(false);
    if (!signedIn) {
      openAuth();
      return;
    }
    if (!canSave) {
      setError("Saved searches are for adopters");
      setOpen(true);
      return;
    }
    setOpen(true);
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await saveSearch({
        name: name.trim() || "My search",
        filters,
        notify: false,
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      if (result.data.mock && userId) {
        appendLocalSavedSearch(userId, result.data.search);
      }
      setDone(true);
      setName("");
      setTimeout(() => {
        setOpen(false);
        setDone(false);
      }, 1200);
    });
  }

  return (
    <div className="relative">
      <Button type="button" variant="ghost" size="sm" onClick={onClickSave}>
        Save search
      </Button>

      {open && signedIn && (
        <div className="absolute right-0 z-30 mt-2 w-64 rounded-lg border border-border bg-card p-3 shadow-md">
          {done ? (
            <p className="text-sm text-foreground" role="status">
              Saved — view them on your account.
            </p>
          ) : (
            <form onSubmit={onSubmit} className="space-y-2">
              <Input
                name="name"
                label="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Dogs in Berlin"
                maxLength={80}
                autoFocus
              />
              {error && (
                <p className="text-xs text-danger" role="alert">
                  {error}
                </p>
              )}
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="flex-1"
                  onClick={() => setOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" size="sm" className="flex-1" disabled={pending}>
                  {pending ? "Saving…" : "Save"}
                </Button>
              </div>
            </form>
          )}
        </div>
      )}

      <AuthSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        intent={intent}
        next={pathname || "/explore"}
      />
    </div>
  );
}
