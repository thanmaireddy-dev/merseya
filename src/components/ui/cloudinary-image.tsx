"use client";
// next/image for photos stored on Cloudinary.
//
// WHY: by default next/image sends every remote photo through Vercel's own
// optimiser: Cloudinary → Vercel → browser, resized twice and counted against
// Vercel's image quota. With this loader, next/image only BUILDS Cloudinary
// URLs (one per screen width for the responsive srcset) and Cloudinary does all
// the resizing and format conversion. Local images (the logos) keep using the
// normal optimiser, because this loader is applied here only.
//
// It's a Client Component because a loader is a function, and functions can't
// be passed from Server Components to the browser.

import Image, { type ImageLoaderProps, type ImageProps } from "next/image";

// `src` looks like (built by src/lib/cloudinary-url.ts):
//   https://res.cloudinary.com/<cloud>/image/upload/c_fill,g_auto,ar_4:5/<publicId>
// We add the requested width to that first transformation, then f_auto
// (WebP/AVIF when the browser supports it) and q_auto (smart compression):
//   …/upload/c_fill,g_auto,ar_4:5,w_640/f_auto,q_auto/<publicId>
function cloudinaryLoader({ src, width }: ImageLoaderProps): string {
  return src.replace(
    /\/image\/upload\/([^/]+)\//,
    (_match, transform: string) => `/image/upload/${transform},w_${width}/f_auto,q_auto/`,
  );
}

export function CloudinaryImage(props: Omit<ImageProps, "loader">) {
  // eslint-disable-next-line jsx-a11y/alt-text -- alt is required by ImageProps and passed through
  return <Image {...props} loader={cloudinaryLoader} />;
}
