// Validation rules for the catalogue file (catalog/products.ts).
// `npm run catalog:sync` checks EVERY product against these rules before it
// writes anything, so a typo can never reach the database half-applied.

import { z } from "zod";
import { categories } from "../src/lib/site-config";

const categorySlugs = categories.map((c) => c.slug) as [string, ...string[]];

const slug = z
  .string()
  .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "use lowercase words separated by hyphens, e.g. rose-gold-jhumka");

const sku = z
  .string()
  .regex(/^[A-Z0-9]+(-[A-Z0-9]+)*$/, "use UPPERCASE letters, digits and hyphens, e.g. MJ-EAR-001");

// Money is integer cents: $48.00 → 4800. Never decimals.
const cents = z.number().int("must be whole cents, e.g. 4800 for $48.00").positive();

// Canadian ring sizes: whole or half sizes, e.g. "6" or "6.5".
const ringSize = z.string().regex(/^\d{1,2}(\.5)?$/, 'use a size like "6" or "6.5"');

const optionalText = z.string().trim().min(1).optional();

const variantSchema = z.object({
  sku,
  ringSize: ringSize.optional(), // rings only
  priceCentsOverride: cents.optional(), // only if this size costs more/less
  // Stock is set ONLY when the variant is first created. Later changes go
  // through `npm run stock:adjust`, so a re-sync never erases sales.
  initialStock: z.number().int().min(0),
});

const imageSchema = z.object({
  // Path inside catalog/photos/, any folder layout, e.g. "earrings/01.jpeg".
  // Replace the file later (same name) and the next sync uploads the new photo.
  file: z
    .string()
    .regex(
      /^([\w-]+\/)*[\w-]+\.(jpe?g|png|webp)$/i,
      'a path inside catalog/photos/ like "earrings/01.jpeg" (forward slashes)',
    ),
  alt: z.string().min(10, "describe the photo for screen-reader users (10+ characters)"),
});

export const productSchema = z
  .object({
    slug,
    name: z.string().trim().min(2),
    description: z.string().trim().min(20),
    categories: z.array(z.enum(categorySlugs)).min(1),
    priceCents: cents,
    baseMaterial: optionalText, // e.g. "Brass": honest disclosure
    finish: optionalText, // e.g. "Gold-plated"
    dimensions: optionalText,
    weightGrams: z.number().positive().optional(),
    careNotes: optionalText,
    contents: z.array(z.string().trim().min(1)).optional(), // mystery boxes
    // true = sample content for development and client demos. `catalog:sync --prod`
    // refuses to run while ANY placeholder remains, so sample data can't reach
    // the live store.
    isPlaceholder: z.boolean().default(false),
    isFeatured: z.boolean().default(false),
    isActive: z.boolean().default(true),
    images: z.array(imageSchema).min(1),
    variants: z.array(variantSchema).min(1),
  })
  .superRefine((p, ctx) => {
    const isRing = p.categories.includes("rings");
    if (isRing && p.variants.some((v) => !v.ringSize)) {
      ctx.addIssue({ code: "custom", path: ["variants"], message: "every ring variant needs a ringSize" });
    }
    if (!isRing && (p.variants.length !== 1 || p.variants[0].ringSize)) {
      ctx.addIssue({
        code: "custom",
        path: ["variants"],
        message: "non-ring products have exactly ONE variant, without ringSize",
      });
    }
    if (p.categories.includes("mystery-boxes") && !p.contents?.length) {
      ctx.addIssue({ code: "custom", path: ["contents"], message: "mystery boxes must list their contents" });
    }
    const sizes = p.variants.map((v) => v.ringSize).filter(Boolean);
    if (new Set(sizes).size !== sizes.length) {
      ctx.addIssue({ code: "custom", path: ["variants"], message: "duplicate ringSize" });
    }
  });

// What you write in products.ts (defaults optional)…
export type ProductInput = z.input<typeof productSchema>;
// …and what the sync script receives after validation (defaults filled in).
export type Product = z.output<typeof productSchema>;
