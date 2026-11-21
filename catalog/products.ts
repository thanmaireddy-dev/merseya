// THE MERSEYA CATALOGUE: product content lives here, under version control.
//
// Workflow: edit this file → `npm run catalog:sync -- --check` (validate only)
// → `npm run catalog:sync` (apply to the dev database) → review → commit.
//
// Rules (see catalog/README.md):
//  - Only real products, real photos and real specifications. Never invent details.
//  - priceCents is in CAD cents: $48.00 → 4800.
//  - Removing a product from this list DEACTIVATES it; it is never deleted.
//  - Stock: `initialStock` applies only the first time a variant is created.
//    Afterwards use `npm run stock:adjust`.

import type { ProductInput } from "./schema";

export const products: ProductInput[] = [
  // Real products are added in task 2.5 from the client's photos and details.
  // Shape of one entry, for reference:
  //
  // {
  //   slug: "example-jhumka",
  //   name: "…",
  //   description: "…",
  //   categories: ["earrings"],
  //   priceCents: 4800,
  //   baseMaterial: "…",
  //   finish: "…",
  //   dimensions: "…",
  //   images: [{ file: "01.jpg", alt: "…" }],
  //   variants: [{ sku: "MJ-EAR-001", initialStock: 3 }],
  // },
];
