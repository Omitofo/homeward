/** Upload rules from docs/07-SECURITY.md */

export const ANIMAL_MEDIA_BUCKET = "animal-media";

/** Max raw upload size before processing (bytes). */
export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024; // 10 MB

/** Longest edge after re-encode. */
export const MAX_IMAGE_EDGE = 2000;

/** Max images attached to a single post (composer will enforce). */
export const MAX_IMAGES_PER_POST = 10;

export const ALLOWED_MIME = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
] as const;

export type AllowedMime = (typeof ALLOWED_MIME)[number];

export const OUTPUT_MIME = "image/webp" as const;
export const OUTPUT_EXT = "webp" as const;
