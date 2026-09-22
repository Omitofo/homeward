"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Avatar, Button, Input } from "@/components/ui";
import { MAX_UPLOAD_BYTES } from "@/lib/media/constants";
import { uploadAnimalImage } from "@/features/posts/upload/actions";
import type { Shelter } from "@/types/domain";
import { updateShelterProfile } from "./actions";
import type { ShelterLinkInput } from "./schema";

type Props = {
  shelter: Shelter;
};

export function ProfileEditor({ shelter }: Props) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [orgName, setOrgName] = useState(shelter.orgName);
  const [bio, setBio] = useState(shelter.bio);
  const [countryCode, setCountryCode] = useState(shelter.countryCode);
  const [region, setRegion] = useState(shelter.region);
  const [city, setCity] = useState(shelter.city);
  const [links, setLinks] = useState<ShelterLinkInput[]>(
    shelter.links.map((l) => ({ label: l.label, url: l.url })),
  );
  const [avatarUrl, setAvatarUrl] = useState<string | null>(shelter.avatarUrl);
  const [localPreview, setLocalPreview] = useState<string | null>(null);

  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const onAvatar = useCallback(async (fileList: FileList | null) => {
    if (!fileList?.[0]) return;
    setError(null);
    const file = fileList[0];
    if (file.size > MAX_UPLOAD_BYTES) {
      setError(`File too large (max ${MAX_UPLOAD_BYTES / (1024 * 1024)} MB)`);
      return;
    }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.set("file", file);
      const result = await uploadAnimalImage(fd);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setAvatarUrl(result.data.publicUrl);
      setLocalPreview(URL.createObjectURL(file));
    } catch {
      setError("Avatar upload failed");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }, []);

  const addLink = () => {
    if (links.length >= 8) return;
    setLinks((prev) => [...prev, { label: "", url: "https://" }]);
  };

  const updateLink = (i: number, patch: Partial<ShelterLinkInput>) => {
    setLinks((prev) => prev.map((l, idx) => (idx === i ? { ...l, ...patch } : l)));
  };

  const removeLink = (i: number) => {
    setLinks((prev) => prev.filter((_, idx) => idx !== i));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaved(false);
    setBusy(true);

    const cleanedLinks = links.filter((l) => l.label.trim() && l.url.trim());

    try {
      const result = await updateShelterProfile({
        orgName,
        bio,
        countryCode,
        region,
        city,
        links: cleanedLinks,
        avatarUrl,
      });

      if (!result.ok) {
        setError(result.error);
        return;
      }

      setSaved(true);
      router.refresh();
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      {/* Avatar */}
      <section className="rounded-lg border border-border bg-card px-4 py-5 sm:px-6">
        <h2 className="text-sm font-medium">Avatar</h2>
        <p className="mt-1 text-xs text-muted">
          Square image works best. Same secure pipeline as post photos.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-4">
          <Avatar
            src={localPreview ?? avatarUrl}
            name={orgName}
            size="xl"
          />
          <div className="flex flex-wrap gap-2">
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif"
              className="sr-only"
              id="shelter-avatar"
              disabled={uploading}
              onChange={(e) => void onAvatar(e.target.files)}
            />
            <Button
              type="button"
              variant="secondary"
              disabled={uploading}
              onClick={() => fileRef.current?.click()}
            >
              {uploading ? "Uploading…" : "Upload photo"}
            </Button>
            {avatarUrl ? (
              <Button
                type="button"
                variant="ghost"
                disabled={uploading}
                onClick={() => {
                  setAvatarUrl(null);
                  setLocalPreview(null);
                }}
              >
                Remove
              </Button>
            ) : null}
          </div>
        </div>
      </section>

      {/* Identity */}
      <section className="space-y-4 rounded-lg border border-border bg-card px-4 py-5 sm:px-6">
        <h2 className="text-sm font-medium">Public identity</h2>

        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-medium">Handle</span>
          <p className="rounded-md border border-border bg-secondary/40 px-3 py-2 text-sm text-muted">
            @{shelter.handle}{" "}
            <span className="text-xs">(fixed)</span>
          </p>
        </div>

        <Input
          label="Organization name"
          name="orgName"
          required
          maxLength={120}
          value={orgName}
          onChange={(e) => setOrgName(e.target.value)}
        />

        <div className="flex flex-col gap-1.5">
          <label htmlFor="bio" className="text-sm font-medium">
            Bio
          </label>
          <textarea
            id="bio"
            name="bio"
            rows={4}
            maxLength={2000}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Who you are, what animals you help, adoption process…"
            className="w-full rounded-md border border-input bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          <p className="text-xs text-muted">{bio.length}/2000</p>
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

      {/* Links */}
      <section className="space-y-4 rounded-lg border border-border bg-card px-4 py-5 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-medium">Links</h2>
            <p className="mt-0.5 text-xs text-muted">
              Website, Instagram, donate page — max 8.
            </p>
          </div>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={links.length >= 8}
            onClick={addLink}
          >
            Add link
          </Button>
        </div>

        {links.length === 0 ? (
          <p className="text-sm text-muted">No links yet.</p>
        ) : (
          <ul className="space-y-3">
            {links.map((link, i) => (
              <li
                key={i}
                className="grid gap-2 rounded-md border border-border p-3 sm:grid-cols-[1fr_2fr_auto]"
              >
                <Input
                  label="Label"
                  name={`link-label-${i}`}
                  maxLength={40}
                  value={link.label}
                  onChange={(e) => updateLink(i, { label: e.target.value })}
                  placeholder="Website"
                />
                <Input
                  label="URL"
                  name={`link-url-${i}`}
                  type="url"
                  maxLength={500}
                  value={link.url}
                  onChange={(e) => updateLink(i, { url: e.target.value })}
                  placeholder="https://"
                />
                <div className="flex items-end">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeLink(i)}
                  >
                    Remove
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {error ? (
        <p className="text-sm text-danger" role="alert">
          {error}
        </p>
      ) : null}
      {saved && !error ? (
        <p className="text-sm text-primary" role="status">
          Profile saved.
        </p>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <Button type="submit" disabled={busy || uploading}>
          {busy ? "Saving…" : "Save profile"}
        </Button>
      </div>
    </form>
  );
}
