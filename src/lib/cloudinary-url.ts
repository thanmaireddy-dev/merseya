// Builds the base Cloudinary URL for a product photo (server-side: it reads the
// cloud name from the validated env). The width is added later by the loader
// in src/components/ui/cloudinary-image.tsx.

import { env } from "@/lib/env";

// Named crops, so every component asks for the same shapes.
const CROPS = {
  // Product cards: fixed 4:5 portrait frame. g_auto lets Cloudinary keep the
  // jewellery in frame, so square, landscape and portrait photos line up.
  card: "c_fill,g_auto,ar_4:5",
  // Full photo, never cropped, only scaled down (product page gallery, Phase 3.3).
  full: "c_limit",
} as const;

export type Crop = keyof typeof CROPS;

export function cloudinaryUrl(publicId: string, crop: Crop): string {
  return `https://res.cloudinary.com/${env.CLOUDINARY_CLOUD_NAME}/image/upload/${CROPS[crop]}/${publicId}`;
}
