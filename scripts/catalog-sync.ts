// npm run catalog:sync               validate, upload new photos, apply to dev DB
// npm run catalog:sync -- --check    validate only (no uploads, no DB writes)
// npm run catalog:sync -- --prod     apply to PRODUCTION (typed confirmation)
//
// Safe to run any number of times (IDEMPOTENT): same catalogue in → same
// database out. Three phases, in this order on purpose:
//   1. VALIDATE everything, so we stop before touching anything if one product is wrong.
//   2. UPLOAD missing photos to Cloudinary (network calls stay OUTSIDE DB transactions).
//   3. WRITE each product inside its own database transaction (all or nothing).

import { createHash } from "node:crypto";
import { existsSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { v2 as cloudinary } from "cloudinary";
import { products as rawProducts } from "../catalog/products";
import { productSchema, type Product } from "../catalog/schema";
import { categories } from "../src/lib/site-config";
import { loadScriptEnv, requireVar } from "./lib/script-env";

const PHOTOS_DIR = path.join("catalog", "photos");
const MAX_BYTES = 10 * 1024 * 1024; // Cloudinary free-plan limit per image
const checkOnly = process.argv.includes("--check");

type UploadedImage = { publicId: string; alt: string; width: number; height: number };

// ─── 1. Validate ────────────────────────────────────────────────────────────
function validateCatalogue(): Product[] {
  const errors: string[] = [];
  const valid: Product[] = [];

  rawProducts.forEach((raw, i) => {
    const label = (raw as { slug?: string }).slug ?? `product #${i + 1}`;
    const result = productSchema.safeParse(raw);
    if (!result.success) {
      for (const issue of result.error.issues) {
        errors.push(`${label} → ${issue.path.join(".") || "(product)"}: ${issue.message}`);
      }
      return;
    }
    for (const img of result.data.images) {
      const file = path.join(PHOTOS_DIR, img.file);
      if (!existsSync(file)) errors.push(`${label} → photo not found: ${file}`);
      else if (statSync(file).size > MAX_BYTES) errors.push(`${label} → photo over 10 MB: ${file}`);
    }
    valid.push(result.data);
  });

  // Rules that span products: slugs and SKUs must be unique catalogue-wide.
  const dupes = (values: string[]) => values.filter((v, i) => values.indexOf(v) !== i);
  for (const s of new Set(dupes(valid.map((p) => p.slug)))) errors.push(`duplicate slug: ${s}`);
  for (const s of new Set(dupes(valid.flatMap((p) => p.variants.map((v) => v.sku))))) {
    errors.push(`duplicate SKU: ${s}`);
  }

  if (errors.length) {
    console.error(`✖ Catalogue has ${errors.length} problem(s). Nothing was changed:\n`);
    for (const e of errors) console.error(`  - ${e}`);
    process.exit(1);
  }
  console.log(`✔ Catalogue valid: ${valid.length} product(s).`);
  return valid;
}

// ─── 2. Upload photos ───────────────────────────────────────────────────────
async function ensureImages(product: Product, stats: { uploaded: number; reused: number }) {
  const out: UploadedImage[] = [];
  for (const [i, img] of product.images.entries()) {
    // CONTENT-FINGERPRINTED ID: position + first 8 chars of the file's hash,
    // e.g. merseya/products/halo-earrings/01-7c0acff8
    //  - same file            → same ID → already uploaded, skipped
    //  - photo replaced later → new hash → new ID → uploaded automatically,
    //    and no browser or CDN can ever show the old cached image.
    const filePath = path.join(PHOTOS_DIR, img.file);
    const hash = createHash("md5").update(readFileSync(filePath)).digest("hex").slice(0, 8);
    const publicId = `merseya/products/${product.slug}/${String(i + 1).padStart(2, "0")}-${hash}`;
    let width: number;
    let height: number;
    try {
      const existing = await cloudinary.api.resource(publicId); // throws 404 if absent
      ({ width, height } = existing);
      stats.reused++;
    } catch (err) {
      const status = (err as { error?: { http_code?: number } }).error?.http_code;
      if (status !== 404) throw err;
      const uploaded = await cloudinary.uploader.upload(filePath, {
        public_id: publicId,
        overwrite: false,
        resource_type: "image",
      });
      ({ width, height } = uploaded);
      stats.uploaded++;
      console.log(`  ↑ uploaded ${publicId}`);
    }
    out.push({ publicId, alt: img.alt, width, height });
  }
  return out;
}

// ─── 3. Write to the database ───────────────────────────────────────────────
async function main() {
  const valid = validateCatalogue();
  if (checkOnly) return;

  await loadScriptEnv("sync the catalogue");
  cloudinary.config({
    cloud_name: requireVar("CLOUDINARY_CLOUD_NAME"),
    api_key: requireVar("CLOUDINARY_API_KEY"),
    api_secret: requireVar("CLOUDINARY_API_SECRET"),
    secure: true,
  });
  // Imported only now: db.ts validates env vars the moment it loads.
  const { db } = await import("../src/lib/db");

  // Categories come from site-config.ts, the same list the menu uses.
  const categoryIds = new Map<string, string>();
  for (const [sortOrder, c] of categories.entries()) {
    const row = await db.category.upsert({
      where: { slug: c.slug },
      create: { slug: c.slug, name: c.name, sortOrder },
      update: { name: c.name, sortOrder, isActive: true },
    });
    categoryIds.set(c.slug, row.id);
  }
  await db.category.updateMany({
    where: { slug: { notIn: categories.map((c) => c.slug) } },
    data: { isActive: false },
  });
  console.log(`✔ Categories: ${categories.length} active.`);

  const stats = { created: 0, updated: 0, uploaded: 0, reused: 0, newVariants: 0 };

  for (const p of valid) {
    const images = await ensureImages(p, stats);

    await db.$transaction(async (tx) => {
      const content = {
        name: p.name,
        description: p.description,
        priceCents: p.priceCents,
        baseMaterial: p.baseMaterial ?? null,
        finish: p.finish ?? null,
        dimensions: p.dimensions ?? null,
        weightGrams: p.weightGrams ?? null,
        careNotes: p.careNotes ?? null,
        contents: p.contents ?? [],
        isFeatured: p.isFeatured,
        isActive: p.isActive,
      };
      const existing = await tx.product.findUnique({ where: { slug: p.slug } });
      const product = existing
        ? await tx.product.update({ where: { id: existing.id }, data: content })
        : await tx.product.create({ data: { slug: p.slug, ...content } });
      if (existing) stats.updated++;
      else stats.created++;

      // Category links: keep exactly the categories listed in the catalogue.
      const wanted = p.categories.map((slug) => categoryIds.get(slug)!);
      await tx.productCategory.deleteMany({
        where: { productId: product.id, categoryId: { notIn: wanted } },
      });
      for (const slug of p.categories) {
        // Position on the category page = order of appearance in products.ts.
        const sortOrder = valid.filter((q) => q.categories.includes(slug)).indexOf(p);
        const categoryId = categoryIds.get(slug)!;
        await tx.productCategory.upsert({
          where: { productId_categoryId: { productId: product.id, categoryId } },
          create: { productId: product.id, categoryId, sortOrder },
          update: { sortOrder },
        });
      }

      // Image rows are DERIVED data (rebuilt from the catalogue each sync and
      // referenced by nothing), so replacing them is safe.
      await tx.productImage.deleteMany({ where: { productId: product.id } });
      await tx.productImage.createMany({
        data: images.map((img, sortOrder) => ({
          productId: product.id,
          cloudinaryPublicId: img.publicId,
          alt: img.alt,
          width: img.width,
          height: img.height,
          sortOrder,
        })),
      });

      // Variants: update details, but NEVER overwrite stock of an existing variant.
      for (const [sortOrder, v] of p.variants.entries()) {
        const details = {
          label: v.ringSize ? `Size ${v.ringSize}` : null,
          ringSize: v.ringSize ?? null,
          priceCentsOverride: v.priceCentsOverride ?? null,
          isActive: true,
          sortOrder,
        };
        const found = await tx.variant.findUnique({ where: { sku: v.sku } });
        if (found && found.productId !== product.id) {
          throw new Error(`SKU ${v.sku} already belongs to another product.`);
        }
        if (found) {
          await tx.variant.update({ where: { id: found.id }, data: details });
        } else {
          await tx.variant.create({
            data: { productId: product.id, sku: v.sku, stock: v.initialStock, ...details },
          });
          stats.newVariants++;
        }
      }
      await tx.variant.updateMany({
        where: { productId: product.id, sku: { notIn: p.variants.map((v) => v.sku) } },
        data: { isActive: false },
      });
    });
  }

  // Products removed from the catalogue are deactivated, never deleted.
  const removed = await db.product.updateMany({
    where: { slug: { notIn: valid.map((p) => p.slug) }, isActive: true },
    data: { isActive: false },
  });

  console.log(
    `✔ Products: ${stats.created} created, ${stats.updated} updated, ${removed.count} deactivated.\n` +
      `✔ Variants: ${stats.newVariants} new (stock set from initialStock).\n` +
      `✔ Photos: ${stats.uploaded} uploaded, ${stats.reused} already on Cloudinary.`,
  );
  await db.$disconnect();
}

main().catch((err) => {
  console.error("✖ Sync failed:", err instanceof Error ? err.message : err);
  process.exit(1);
});
