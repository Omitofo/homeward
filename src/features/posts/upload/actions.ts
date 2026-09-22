"use server";

import { randomUUID } from "crypto";
import { getCurrentProfile } from "@/features/auth/session";
import type { ActionResult } from "@/features/auth/types";
import { getShelterForProfile } from "@/features/shelters";
import {
  ANIMAL_MEDIA_BUCKET,
  OUTPUT_EXT,
  validateImageBytes,
} from "@/lib/media";
import { processAnimalImage } from "@/lib/media/process";
import { createClient } from "@/lib/supabase/server";

const useMock = process.env.NEXT_PUBLIC_USE_MOCK_DATA !== "false";

export type UploadedMedia = {
  storagePath: string;
  publicUrl: string;
  width: number;
  height: number;
  mock: boolean;
};

/**
 * Validate → process (strip EXIF, resize, WebP) → store under shelter path.
 */
export async function uploadAnimalImage(
  formData: FormData,
): Promise<ActionResult<UploadedMedia>> {
  const profile = await getCurrentProfile();
  if (!profile) {
    return { ok: false, error: "Sign in required" };
  }
  if (profile.role !== "shelter" && profile.role !== "admin") {
    return { ok: false, error: "Only rescue accounts can upload animal photos" };
  }

  const shelter = await getShelterForProfile(profile.id);
  if (!shelter) {
    return { ok: false, error: "No shelter profile linked to this account" };
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return { ok: false, error: "Missing file" };
  }

  const arrayBuffer = await file.arrayBuffer();
  const validated = validateImageBytes(arrayBuffer);
  if (!validated.ok) {
    return { ok: false, error: validated.error };
  }

  const processed = await processAnimalImage(validated.data.bytes);
  if (!processed.ok) {
    return { ok: false, error: processed.error };
  }

  const id = randomUUID();
  const storagePath = `${shelter.id}/${id}.${OUTPUT_EXT}`;

  if (useMock) {
    return {
      ok: true,
      data: {
        storagePath: `mock/${storagePath}`,
        publicUrl: `https://picsum.photos/seed/${id}/800/${Math.round((800 * processed.data.height) / processed.data.width)}`,
        width: processed.data.width,
        height: processed.data.height,
        mock: true,
      },
    };
  }

  const supabase = await createClient();
  if (!supabase) {
    return { ok: false, error: "Supabase is not configured" };
  }

  const { error: uploadError } = await supabase.storage
    .from(ANIMAL_MEDIA_BUCKET)
    .upload(storagePath, processed.data.buffer, {
      contentType: processed.data.mime,
      upsert: false,
      cacheControl: "31536000",
    });

  if (uploadError) {
    console.error("[upload] storage", uploadError.message);
    return { ok: false, error: "Upload failed. Try again." };
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(ANIMAL_MEDIA_BUCKET).getPublicUrl(storagePath);

  return {
    ok: true,
    data: {
      storagePath,
      publicUrl,
      width: processed.data.width,
      height: processed.data.height,
      mock: false,
    },
  };
}
