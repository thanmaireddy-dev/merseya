# Merseya brand assets

**Status:** the logo design is final (confirmed 2026-11-19).

## Where files live, and why
- **`public/images/brand/`** holds files the website serves. Everything in `public/` is reachable by URL.
- **`docs/brand/logo/`** holds our own brand files kept for reference.
- **`docs/brand/references/`** holds third-party inspiration images: the palette mood board, the sample website and the Valoria specimen. They are **git-ignored and kept locally only**, because the repo is public and those images aren't ours to republish.

## Logos in `public/images/brand/` (transparent PNG, RGBA)

| File | Size | Use |
|---|---|---|
| `merseya-logo-plum.png` | 2400×2138 | Full lockup on light backgrounds (ivory, blush) |
| `merseya-logo-blush.png` | 2400×2138 | Full lockup on dark backgrounds (deep plum footer and sections) |
| `merseya-monogram.png` | 1024×1006 | MJ monogram app-tile. Source for the favicon, apple-touch-icon, social avatar and email header |

How we use them:
- Always render them through `next/image`, which serves resized WebP/AVIF versions. Never ship the 2400px original to phones.
- The logo's plum ink is about `#4A1630`, a little darker and redder than the palette's Plum `#683844`. Use the logo as supplied and **never recolour it**. The UI palette stays as defined in `plan.md` §14.1.
- The only SVG we have is auto-traced and is not used. If a true vector is ever made from the original design file, it replaces these PNGs.

## Brand palette and type
See `plan.md` §14 for the palette and type. Headings use Cormorant Garamond; body text uses DM Sans.
