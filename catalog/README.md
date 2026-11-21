# Merseya catalogue

Product **content** lives in `products.ts`, version-controlled. **Photos** live in `photos/`, which is git-ignored: the files are large, and Cloudinary plus the client's originals are their backup.

```
catalog/
  products.ts                       ← one entry per product
  schema.ts                         ← validation rules
  photos/<product-slug>/01.jpg      ← 01 = main photo, then 02, 03 …
```

## Add or change a product
1. Put the photos in `catalog/photos/<product-slug>/` as `01.jpg`, `02.jpg`, and so on.
2. Add or edit the entry in `products.ts`.
3. Run `npm run catalog:sync -- --check`. This validates only and changes nothing.
4. Run `npm run catalog:sync`. This uploads new photos and updates the **dev** database.
5. Check the site locally, then commit `products.ts`.

Production uses `--prod`, which loads `.env.prod` and asks you to type `PRODUCTION`.

## Rules
- **Only real information.** Material, plating and dimensions must come from the supplier or a measurement. Never guess or invent.
- `priceCents` is in CAD cents: $48.00 is `4800`.
- **SKU format:** `MJ-<TYPE>-<NNN>`, where TYPE is SET, EAR, BRD, RNG, HAIR or BOX. Rings get one SKU per size, e.g. `MJ-RNG-001-7`.
- **Stock:** `initialStock` applies only when a variant is first created. After that, use:
  - `npm run stock:adjust -- <SKU> +2` (received more)
  - `npm run stock:adjust -- <SKU> -1` (damaged)
  - `npm run stock:adjust -- <SKU> =5` (after counting)
- **Removing** a product from `products.ts` deactivates it on the next sync. Nothing is ever deleted.

## Photo guidelines
- JPG, PNG or WebP, under 10 MB, ideally at least 1600 px on the longest side.
- Photo `01` is the main listing image: the product alone, on a consistent, plain background.
- Add at least one more photo showing scale (worn, or in a hand) when available.
- Cloudinary resizes and converts the images for the website, so upload originals and don't compress them yourself.
