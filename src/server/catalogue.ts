// Catalogue data for the storefront. Pages call these functions; they never
// query Prisma directly. That keeps the rules in ONE place:
//  - only ACTIVE products and variants are shown;
//  - price and stock state are computed here, on the server;
//  - pages receive plain, display-ready objects (no database internals).
//
// CACHING: results are cached ("use cache") for hours and tagged "catalogue".
// Catalogue changes are rare (a developer runs catalog:sync), and displayed
// stock is only informational: checkout (Phase 4) always re-reads the real
// price and stock from the database before taking payment.

import "server-only"; // build error if this file is ever imported into the browser
import { cacheLife, cacheTag } from "next/cache";
import type { Prisma } from "@/generated/prisma/client";
import { cloudinaryUrl } from "@/lib/cloudinary-url";
import { db } from "@/lib/db";

const LOW_STOCK_THRESHOLD = 2; // "Only 2 left" / "Only 1 left"

export type StockState =
  | { kind: "in_stock" }
  | { kind: "low"; unitsLeft: number }
  | { kind: "sold_out" };

export type ProductSummary = {
  slug: string;
  name: string;
  priceCents: number; // lowest price across active variants
  hasPriceRange: boolean; // true → show "From $X"
  image: { src: string; alt: string } | null;
  stock: StockState;
};

const summarySelect = {
  slug: true,
  name: true,
  priceCents: true,
  images: { orderBy: { sortOrder: "asc" }, take: 1 },
  variants: {
    where: { isActive: true },
    select: { stock: true, priceCentsOverride: true },
  },
} satisfies Prisma.ProductSelect;

type SummaryRow = Prisma.ProductGetPayload<{ select: typeof summarySelect }>;

function toSummary(p: SummaryRow): ProductSummary {
  const prices = p.variants.map((v) => v.priceCentsOverride ?? p.priceCents);
  const minPrice = prices.length ? Math.min(...prices) : p.priceCents;
  // Negative stock (a flagged oversell) counts as zero for display.
  const unitsLeft = p.variants.reduce((sum, v) => sum + Math.max(v.stock, 0), 0);
  const image = p.images[0];

  return {
    slug: p.slug,
    name: p.name,
    priceCents: minPrice,
    hasPriceRange: new Set(prices).size > 1,
    image: image ? { src: cloudinaryUrl(image.cloudinaryPublicId, "card"), alt: image.alt } : null,
    stock:
      unitsLeft === 0
        ? { kind: "sold_out" }
        : unitsLeft <= LOW_STOCK_THRESHOLD
          ? { kind: "low", unitsLeft }
          : { kind: "in_stock" },
  };
}

/** A category page: its details plus active products, in catalogue order. */
export async function getCollection(slug: string) {
  "use cache";
  cacheLife("hours");
  cacheTag("catalogue");

  const category = await db.category.findFirst({
    where: { slug, isActive: true },
    include: {
      products: {
        where: { product: { isActive: true } },
        orderBy: { sortOrder: "asc" },
        include: { product: { select: summarySelect } },
      },
    },
  });
  if (!category) return null;

  return {
    slug: category.slug,
    name: category.name,
    description: category.description,
    products: category.products.map((link) => toSummary(link.product)),
  };
}

/** Products marked isFeatured, for the homepage. */
export async function getFeaturedProducts(limit = 8): Promise<ProductSummary[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("catalogue");

  const rows = await db.product.findMany({
    where: { isActive: true, isFeatured: true },
    orderBy: { createdAt: "asc" },
    take: limit,
    select: summarySelect,
  });
  return rows.map(toSummary);
}

/** Every active product (used by the temporary dev preview page). */
export async function getAllProducts(): Promise<ProductSummary[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("catalogue");

  const rows = await db.product.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "asc" },
    select: summarySelect,
  });
  return rows.map(toSummary);
}
