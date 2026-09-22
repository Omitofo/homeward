"use server";

import { randomUUID } from "crypto";
import { getCurrentProfile } from "@/features/auth/session";
import type { ActionResult } from "@/features/auth/types";
import { getShelterForProfile } from "@/features/shelters";
import { createClient } from "@/lib/supabase/server";
import type { VerificationDocInput } from "./schema";

const useMock = process.env.NEXT_PUBLIC_USE_MOCK_DATA !== "false";

export const VERIFICATION_DOCS_BUCKET = "verification-docs";
export const MAX_DOC_BYTES = 10 * 1024 * 1024;

const PDF_MAGIC = [0x25, 0x50, 0x44, 0x46]; // %PDF
const JPEG_MAGIC = [0xff, 0xd8, 0xff];
const PNG_MAGIC = [0x89, 0x50, 0x4e, 0x47];
const WEBP_RIFF = [0x52, 0x49, 0x46, 0x46];

function matchesMagic(bytes: Uint8Array, magic: number[]): boolean {
  if (bytes.length < magic.length) return false;
  return magic.every((b, i) => bytes[i] === b);
}

function detectDoc(
  buffer: ArrayBuffer,
): { ok: true; mime: string; ext: string } | { ok: false; error: string } {
  const bytes = new Uint8Array(buffer);
  if (matchesMagic(bytes, PDF_MAGIC)) {
    return { ok: true, mime: "application/pdf", ext: "pdf" };
  }
  if (matchesMagic(bytes, JPEG_MAGIC)) {
    return { ok: true, mime: "image/jpeg", ext: "jpg" };
  }
  if (matchesMagic(bytes, PNG_MAGIC)) {
    return { ok: true, mime: "image/png", ext: "png" };
  }
  if (
    matchesMagic(bytes, WEBP_RIFF) &&
    bytes.length >= 12 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  ) {
    return { ok: true, mime: "image/webp", ext: "webp" };
  }
  return {
    ok: false,
    error: "Only PDF, JPEG, PNG, or WebP documents are allowed",
  };
}

/**
 * Upload a verification document to the private bucket.
 * Files are NOT re-encoded (PDFs stay PDFs); magic-byte validated only.
 */
export async function uploadVerificationDoc(
  formData: FormData,
): Promise<ActionResult<VerificationDocInput>> {
  const profile = await getCurrentProfile();
  if (!profile) return { ok: false, error: "Sign in required" };
  if (profile.role !== "shelter" && profile.role !== "admin") {
    return { ok: false, error: "Only rescue accounts can upload verification documents" };
  }

  const shelter = await getShelterForProfile(profile.id);
  if (!shelter) {
    return { ok: false, error: "No shelter profile linked to this account" };
  }

  if (shelter.verificationStatus === "verified") {
    return { ok: false, error: "Your rescue is already verified" };
  }
  if (shelter.verificationStatus === "pending") {
    return { ok: false, error: "A verification request is already pending" };
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return { ok: false, error: "Missing file" };
  }
  if (file.size > MAX_DOC_BYTES) {
    return {
      ok: false,
      error: `File too large (max ${MAX_DOC_BYTES / (1024 * 1024)} MB)`,
    };
  }

  const arrayBuffer = await file.arrayBuffer();
  const detected = detectDoc(arrayBuffer);
  if (!detected.ok) return { ok: false, error: detected.error };

  const id = randomUUID();
  const storagePath = `${shelter.id}/${id}.${detected.ext}`;
  const safeName = file.name.replace(/[^\w.\-()+ ]/g, "_").slice(0, 180) || `doc.${detected.ext}`;

  if (useMock) {
    return {
      ok: true,
      data: {
        path: `mock/${storagePath}`,
        fileName: safeName,
        mime: detected.mime,
        size: file.size,
      },
    };
  }

  const supabase = await createClient();
  if (!supabase) {
    return { ok: false, error: "Supabase is not configured" };
  }

  const { error } = await supabase.storage
    .from(VERIFICATION_DOCS_BUCKET)
    .upload(storagePath, arrayBuffer, {
      contentType: detected.mime,
      upsert: false,
      cacheControl: "3600",
    });

  if (error) {
    console.error("[uploadVerificationDoc]", error.message);
    return { ok: false, error: "Upload failed. Try again." };
  }

  return {
    ok: true,
    data: {
      path: storagePath,
      fileName: safeName,
      mime: detected.mime,
      size: file.size,
    },
  };
}
