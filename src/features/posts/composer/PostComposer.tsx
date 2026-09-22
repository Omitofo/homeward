"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Input } from "@/components/ui";
import { MAX_UPLOAD_BYTES } from "@/lib/media/constants";
import { uploadAnimalImage } from "@/features/posts/upload/actions";
import type { AnimalPost } from "@/types/domain";
import { createAnimalPost, updateAnimalPost } from "./actions";
import {
  AGE_GROUP,
  POST_STATUS,
  SEX,
  SIZE,
  SPECIES,
  TRAIT_OPTIONS,
  type MediaItemInput,
  type PostComposerInput,
} from "./schema";

type Props = {
  mode: "create" | "edit";
  /** Prefill when editing. */
  initial?: AnimalPost;
  /** Defaults from shelter profile for create. */
  defaults?: {
    countryCode?: string;
    region?: string;
    city?: string;
  };
};

type LocalMedia = MediaItemInput & { localPreview?: string };

function postToForm(post: AnimalPost): Omit<PostComposerInput, "media"> & {
  media: LocalMedia[];
} {
  return {
    name: post.name,
    species: post.species,
    breed: post.breed,
    sex: post.sex,
    ageMonths: post.ageMonths,
    ageGroup: post.ageGroup,
    size: post.size,
    description: post.description,
    countryCode: post.countryCode,
    region: post.region,
    city: post.city,
    status: post.status,
    traits: post.traits,
    media: post.media.map((m) => ({
      id: m.id,
      storagePath: m.url.includes("/animal-media/")
        ? m.url.split("/animal-media/")[1] ?? m.url
        : m.url,
      publicUrl: m.url,
      width: m.width,
      height: m.height,
      altText: m.altText,
    })),
  };
}

export function PostComposer({ mode, initial, defaults }: Props) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const seed = useMemo(() => {
    if (initial) return postToForm(initial);
    return {
      name: "",
      species: "dog" as const,
      breed: "",
      sex: "unknown" as const,
      ageMonths: 12,
      ageGroup: "young" as const,
      size: "medium" as const,
      description: "",
      countryCode: defaults?.countryCode ?? "",
      region: defaults?.region ?? "",
      city: defaults?.city ?? "",
      status: "available" as const,
      traits: [] as string[],
      media: [] as LocalMedia[],
    };
  }, [initial, defaults]);

  const [name, setName] = useState(seed.name);
  const [species, setSpecies] = useState(seed.species);
  const [breed, setBreed] = useState(seed.breed);
  const [sex, setSex] = useState(seed.sex);
  const [ageMonths, setAgeMonths] = useState(String(seed.ageMonths));
  const [ageGroup, setAgeGroup] = useState(seed.ageGroup);
  const [size, setSize] = useState(seed.size);
  const [description, setDescription] = useState(seed.description);
  const [countryCode, setCountryCode] = useState(seed.countryCode);
  const [region, setRegion] = useState(seed.region);
  const [city, setCity] = useState(seed.city);
  const [status, setStatus] = useState(seed.status);
  const [traits, setTraits] = useState<string[]>(seed.traits);
  const [media, setMedia] = useState<LocalMedia[]>(seed.media);

  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleTrait = (t: string) => {
    setTraits((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t],
    );
  };

  const onPickFiles = useCallback(async (fileList: FileList | null) => {
    if (!fileList?.length) return;
    setError(null);

    const remaining = 10 - media.length;
    if (remaining <= 0) {
      setError("Maximum 10 photos");
      return;
    }

    const files = Array.from(fileList).slice(0, remaining);
    setUploading(true);

    try {
      for (const file of files) {
        if (file.size > MAX_UPLOAD_BYTES) {
          setError(
            `File too large (max ${MAX_UPLOAD_BYTES / (1024 * 1024)} MB)`,
          );
          continue;
        }
        const fd = new FormData();
        fd.set("file", file);
        const result = await uploadAnimalImage(fd);
        if (!result.ok) {
          setError(result.error);
          continue;
        }
        const localPreview = URL.createObjectURL(file);
        setMedia((prev) => [
          ...prev,
          {
            storagePath: result.data.storagePath,
            publicUrl: result.data.publicUrl,
            width: result.data.width,
            height: result.data.height,
            altText: "",
            localPreview,
          },
        ]);
      }
    } catch {
      setError("Unexpected upload error");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }, [media.length]);

  const moveMedia = (index: number, dir: -1 | 1) => {
    setMedia((prev) => {
      const next = [...prev];
      const j = index + dir;
      if (j < 0 || j >= next.length) return prev;
      [next[index], next[j]] = [next[j], next[index]];
      return next;
    });
  };

  const removeMedia = (index: number) => {
    setMedia((prev) => prev.filter((_, i) => i !== index));
  };

  const setAlt = (index: number, altText: string) => {
    setMedia((prev) =>
      prev.map((m, i) => (i === index ? { ...m, altText } : m)),
    );
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);

    const payload: PostComposerInput = {
      name,
      species,
      breed,
      sex,
      ageMonths: Number(ageMonths) || 0,
      ageGroup,
      size,
      description,
      countryCode,
      region,
      city,
      status,
      traits,
      media: media.map(({ localPreview: _, ...rest }) => rest),
    };

    try {
      const result =
        mode === "create"
          ? await createAnimalPost(payload)
          : await updateAnimalPost(initial!.id, payload);

      if (!result.ok) {
        setError(result.error);
        return;
      }

      router.push(`/studio/post/${result.data.id}`);
      router.refresh();
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setBusy(false);
    }
  };

  const selectClass =
    "h-10 w-full rounded-md border border-input bg-card px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      {/* Photos */}
      <section className="rounded-lg border border-border bg-card px-4 py-5 sm:px-6">
        <h2 className="text-sm font-medium">Photos</h2>
        <p className="mt-1 text-xs text-muted">
          1–10 images · JPEG / PNG / WebP / AVIF · max{" "}
          {MAX_UPLOAD_BYTES / (1024 * 1024)} MB each · EXIF stripped
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            multiple
            className="sr-only"
            id="composer-photos"
            disabled={uploading || media.length >= 10}
            onChange={(e) => void onPickFiles(e.target.files)}
          />
          <Button
            type="button"
            variant="secondary"
            disabled={uploading || media.length >= 10}
            onClick={() => inputRef.current?.click()}
          >
            {uploading ? "Uploading…" : "Add photos"}
          </Button>
        </div>

        {media.length > 0 ? (
          <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {media.map((item, i) => (
              <li
                key={`${item.storagePath}-${i}`}
                className="overflow-hidden rounded-lg border border-border bg-background"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.localPreview ?? item.publicUrl}
                  alt={item.altText || ""}
                  className="aspect-[4/5] w-full object-cover"
                />
                <div className="space-y-2 p-2">
                  <input
                    type="text"
                    value={item.altText}
                    onChange={(e) => setAlt(i, e.target.value)}
                    placeholder="Alt text"
                    maxLength={200}
                    className="h-8 w-full rounded border border-input bg-card px-2 text-xs"
                  />
                  <div className="flex flex-wrap gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      disabled={i === 0}
                      onClick={() => moveMedia(i, -1)}
                    >
                      ↑
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      disabled={i === media.length - 1}
                      onClick={() => moveMedia(i, 1)}
                    >
                      ↓
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeMedia(i)}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : null}
      </section>

      {/* Basics */}
      <section className="space-y-4 rounded-lg border border-border bg-card px-4 py-5 sm:px-6">
        <h2 className="text-sm font-medium">Animal details</h2>

        <Input
          label="Name"
          name="name"
          required
          maxLength={80}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Luna"
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="species" className="text-sm font-medium">
              Species
            </label>
            <select
              id="species"
              className={selectClass}
              value={species}
              onChange={(e) =>
                setSpecies(e.target.value as (typeof SPECIES)[number])
              }
            >
              {SPECIES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <Input
            label="Breed"
            name="breed"
            maxLength={80}
            value={breed}
            onChange={(e) => setBreed(e.target.value)}
            placeholder="Mixed, or specific breed"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="sex" className="text-sm font-medium">
              Sex
            </label>
            <select
              id="sex"
              className={selectClass}
              value={sex}
              onChange={(e) => setSex(e.target.value as (typeof SEX)[number])}
            >
              {SEX.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <Input
            label="Age (months)"
            name="ageMonths"
            type="number"
            min={0}
            max={360}
            value={ageMonths}
            onChange={(e) => setAgeMonths(e.target.value)}
          />

          <div className="flex flex-col gap-1.5">
            <label htmlFor="ageGroup" className="text-sm font-medium">
              Age group
            </label>
            <select
              id="ageGroup"
              className={selectClass}
              value={ageGroup}
              onChange={(e) =>
                setAgeGroup(e.target.value as (typeof AGE_GROUP)[number])
              }
            >
              {AGE_GROUP.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="size" className="text-sm font-medium">
              Size
            </label>
            <select
              id="size"
              className={selectClass}
              value={size}
              onChange={(e) => setSize(e.target.value as (typeof SIZE)[number])}
            >
              {SIZE.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="status" className="text-sm font-medium">
              Status
            </label>
            <select
              id="status"
              className={selectClass}
              value={status}
              onChange={(e) =>
                setStatus(e.target.value as (typeof POST_STATUS)[number])
              }
            >
              {POST_STATUS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="description" className="text-sm font-medium">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            required
            rows={5}
            maxLength={5000}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Personality, needs, history — help adopters fall in love."
            className="w-full rounded-md border border-input bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          <p className="text-xs text-muted">{description.length}/5000</p>
        </div>
      </section>

      {/* Location */}
      <section className="space-y-4 rounded-lg border border-border bg-card px-4 py-5 sm:px-6">
        <h2 className="text-sm font-medium">Location</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <Input
            label="Country code"
            name="countryCode"
            required
            maxLength={2}
            value={countryCode}
            onChange={(e) => setCountryCode(e.target.value.toUpperCase())}
            placeholder="DE"
            hint="ISO 3166-1 alpha-2"
          />
          <Input
            label="Region"
            name="region"
            maxLength={80}
            value={region}
            onChange={(e) => setRegion(e.target.value)}
          />
          <Input
            label="City"
            name="city"
            maxLength={80}
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />
        </div>
      </section>

      {/* Traits */}
      <section className="rounded-lg border border-border bg-card px-4 py-5 sm:px-6">
        <h2 className="text-sm font-medium">Traits</h2>
        <p className="mt-1 text-xs text-muted">Optional tags for filters.</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {TRAIT_OPTIONS.map((t) => {
            const on = traits.includes(t);
            return (
              <button
                key={t}
                type="button"
                onClick={() => toggleTrait(t)}
                className={
                  on
                    ? "rounded-full border border-primary bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
                    : "rounded-full border border-border bg-background px-3 py-1 text-xs text-muted hover:border-foreground/30"
                }
              >
                {t}
              </button>
            );
          })}
        </div>
      </section>

      {error ? (
        <p className="text-sm text-danger" role="alert">
          {error}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <Button type="submit" disabled={busy || uploading}>
          {busy
            ? mode === "create"
              ? "Publishing…"
              : "Saving…"
            : mode === "create"
              ? "Publish post"
              : "Save changes"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          disabled={busy}
          onClick={() => router.push("/studio")}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
