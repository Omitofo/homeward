export {
  ANIMAL_MEDIA_BUCKET,
  MAX_UPLOAD_BYTES,
  MAX_IMAGE_EDGE,
  MAX_IMAGES_PER_POST,
  ALLOWED_MIME,
  OUTPUT_MIME,
  OUTPUT_EXT,
  type AllowedMime,
} from "./constants";
export {
  detectImageMime,
  validateImageBytes,
  type ValidatedImage,
} from "./validate";

// processAnimalImage depends on sharp (Node-only). Do not re-export it here
// or client components that only need constants will pull fs/child_process.
// Server code: import { processAnimalImage } from "@/lib/media/process";
