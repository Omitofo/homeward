import sharp from "sharp";
import { MAX_IMAGE_EDGE, OUTPUT_MIME } from "./constants";

export type ProcessedImage = {
  buffer: Buffer;
  width: number;
  height: number;
  mime: typeof OUTPUT_MIME;
};

/**
 * Re-encode to WebP, strip all metadata (EXIF/GPS), clamp longest edge.
 */
export async function processAnimalImage(
  bytes: Uint8Array,
): Promise<{ ok: true; data: ProcessedImage } | { ok: false; error: string }> {
  try {
    const pipeline = sharp(Buffer.from(bytes), {
      failOn: "error",
      limitInputPixels: 40_000_000,
    }).rotate();

    const meta = await pipeline.metadata();
    if (!meta.width || !meta.height) {
      return { ok: false, error: "Could not read image dimensions" };
    }

    const longest = Math.max(meta.width, meta.height);
    const resized =
      longest > MAX_IMAGE_EDGE
        ? pipeline.resize({
            width: meta.width >= meta.height ? MAX_IMAGE_EDGE : undefined,
            height: meta.height > meta.width ? MAX_IMAGE_EDGE : undefined,
            fit: "inside",
            withoutEnlargement: true,
          })
        : pipeline;

    const { data, info } = await resized
      .webp({ quality: 82, effort: 4 })
      .toBuffer({ resolveWithObject: true });

    if (!info.width || !info.height) {
      return { ok: false, error: "Processing produced empty dimensions" };
    }

    return {
      ok: true,
      data: {
        buffer: data,
        width: info.width,
        height: info.height,
        mime: OUTPUT_MIME,
      },
    };
  } catch (err) {
    console.error("[media] process", err instanceof Error ? err.message : err);
    return { ok: false, error: "Could not process image" };
  }
}
