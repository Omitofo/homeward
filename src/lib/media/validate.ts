import {
  ALLOWED_MIME,
  MAX_UPLOAD_BYTES,
  type AllowedMime,
} from "./constants";

export type ValidatedImage = {
  mime: AllowedMime;
  bytes: Uint8Array;
};

function startsWith(bytes: Uint8Array, sig: number[]): boolean {
  if (bytes.length < sig.length) return false;
  return sig.every((b, i) => bytes[i] === b);
}

/** Detect type from magic bytes — never trust client MIME/extension. */
export function detectImageMime(bytes: Uint8Array): AllowedMime | null {
  if (startsWith(bytes, [0xff, 0xd8, 0xff])) return "image/jpeg";

  if (
    startsWith(bytes, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
  ) {
    return "image/png";
  }

  if (
    bytes.length >= 12 &&
    startsWith(bytes, [0x52, 0x49, 0x46, 0x46]) &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  ) {
    return "image/webp";
  }

  if (bytes.length >= 12 && startsWith(bytes, [0x00, 0x00, 0x00])) {
    const box = String.fromCharCode(
      bytes[4],
      bytes[5],
      bytes[6],
      bytes[7],
    );
    if (box === "ftyp") {
      const brand = String.fromCharCode(
        bytes[8],
        bytes[9],
        bytes[10],
        bytes[11],
      );
      if (brand === "avif" || brand === "avis" || brand === "mif1") {
        return "image/avif";
      }
    }
  }

  return null;
}

export function validateImageBytes(
  input: ArrayBuffer | Uint8Array,
): { ok: true; data: ValidatedImage } | { ok: false; error: string } {
  const bytes =
    input instanceof Uint8Array ? input : new Uint8Array(input);

  if (bytes.byteLength === 0) {
    return { ok: false, error: "Empty file" };
  }
  if (bytes.byteLength > MAX_UPLOAD_BYTES) {
    return {
      ok: false,
      error: `File too large (max ${MAX_UPLOAD_BYTES / (1024 * 1024)} MB)`,
    };
  }

  const mime = detectImageMime(bytes);
  if (!mime || !ALLOWED_MIME.includes(mime)) {
    return {
      ok: false,
      error: "Unsupported image type. Use JPEG, PNG, WebP, or AVIF.",
    };
  }

  return { ok: true, data: { mime, bytes } };
}
