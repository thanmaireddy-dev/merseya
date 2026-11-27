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
//
// ⚠ ALL ENTRIES BELOW ARE PLACEHOLDERS (isPlaceholder: true) for development
// and the client demo. Names, prices and descriptions are samples, and the
// photos are not final. Descriptions state only what is visible in the photo;
// material, finish and dimensions are left out until the client confirms them.
// `catalog:sync --prod` refuses to run while any placeholder remains.

import type { ProductInput } from "./schema";

export const products: ProductInput[] = [
  // ─── Earrings ─────────────────────────────────────────────────────────────
  {
    slug: "halo-earrings",
    name: "Halo Earrings",
    description:
      "Circle drop earrings with a crystal-set hoop, finished in a gold tone. Light enough for everyday wear.",
    categories: ["earrings"],
    priceCents: 4800,
    baseMaterial: "Stainless steel",
    finish: "Gold-plated",
    dimensions: "Hoop diameter 1 cm",
    isPlaceholder: true,
    isFeatured: true,
    images: [
      {
        file: "earrings/01.jpeg",
        alt: "Pair of gold-tone circle drop earrings with crystal-set hoops on an ivory display card",
      },
    ],
    variants: [{ sku: "MJ-EAR-001", initialStock: 3 }],
  },
  {
    slug: "square-crystal-drop-earrings",
    name: "Square Crystal Drop Earrings",
    description:
      "Gold-tone drop earrings, each holding a single square-cut clear crystal. A simple, polished pair for work or evenings out.",
    categories: ["earrings"],
    priceCents: 3800,
    isPlaceholder: true,
    images: [
      {
        file: "earrings/02.jpeg",
        alt: "Pair of gold-tone drop earrings with square clear crystals on an ivory display card",
      },
    ],
    variants: [{ sku: "MJ-EAR-002", initialStock: 3 }],
  },
  {
    slug: "long-pearl-jhumka-earrings",
    name: "Long Pearl Jhumka Earrings",
    description:
      "Long gold-tone earrings with pink and green stones and pearl accents, finishing in a small jhumka. A statement pair for festive occasions.",
    categories: ["earrings"],
    priceCents: 5200,
    isPlaceholder: true,
    images: [
      {
        file: "earrings/03-crop.jpeg",
        alt: "Long gold-tone jhumka earrings with pink and green stones and pearl drops on a dark stand",
      },
    ],
    variants: [{ sku: "MJ-EAR-003", initialStock: 3 }],
  },
  {
    slug: "temple-jhumka-earrings",
    name: "Temple Jhumka Earrings",
    description:
      "Gold-tone jhumka earrings with green and red stones and a fringe of pearl and red beads. Traditional styling for festivals and weddings.",
    categories: ["earrings"],
    priceCents: 4500,
    isPlaceholder: true,
    isFeatured: true,
    images: [
      {
        file: "earrings/04-crop.jpeg",
        alt: "Gold-tone jhumka earrings with green stones and pearl and red bead fringe on a velvet stand",
      },
    ],
    variants: [{ sku: "MJ-EAR-004", initialStock: 3 }],
  },

  // ─── Rings (one SKU per Canadian size; sizes and stock are placeholders) ──
  {
    slug: "gold-tone-band-ring",
    name: "Gold-Tone Band Ring",
    description:
      "A smooth gold-tone band with a small crystal accent. Wear it alone or stacked with other rings.",
    categories: ["rings"],
    priceCents: 2400,
    isPlaceholder: true,
    images: [
      {
        file: "rings/01.jpeg",
        alt: "Hand wearing gold-tone band rings, one set with a small crystal",
      },
    ],
    variants: [
      { sku: "MJ-RNG-001-6", ringSize: "6", initialStock: 1 },
      { sku: "MJ-RNG-001-7", ringSize: "7", initialStock: 1 },
      { sku: "MJ-RNG-001-8", ringSize: "8", initialStock: 1 },
    ],
  },
  {
    slug: "crystal-halo-ring",
    name: "Crystal Halo Ring",
    description:
      "A silver-tone ring with a round centre crystal framed by smaller crystals. Pairs well with pavé bands.",
    categories: ["rings"],
    priceCents: 2800,
    isPlaceholder: true,
    images: [
      {
        file: "rings/02.jpeg",
        alt: "Hand holding silver-tone crystal rings, including a round halo ring",
      },
    ],
    variants: [
      { sku: "MJ-RNG-002-6", ringSize: "6", initialStock: 1 },
      { sku: "MJ-RNG-002-7", ringSize: "7", initialStock: 1 },
      { sku: "MJ-RNG-002-8", ringSize: "8", initialStock: 1 },
    ],
  },

  // ─── Jewellery sets (some also appear in Bridal) ──────────────────────────
  {
    slug: "antique-gold-necklace-set",
    name: "Antique Gold-Tone Necklace Set",
    description:
      "A gold-tone necklace with a textured antique look and a red stone centre, paired with matching drop earrings.",
    categories: ["sets"],
    priceCents: 8900,
    isPlaceholder: true,
    isFeatured: true,
    images: [
      {
        file: "sets/01.jpeg",
        alt: "Antique gold-tone necklace with red stone centre and matching earrings on a beige bust",
      },
    ],
    variants: [{ sku: "MJ-SET-001", initialStock: 3 }],
  },
  {
    slug: "leaf-crystal-necklace-set",
    name: "Leaf Crystal Necklace Set",
    description:
      "A leaf-motif necklace set with clear crystals and pink and green stone accents, with matching earrings. Made for weddings and receptions.",
    categories: ["sets", "bridal"],
    priceCents: 12900,
    isPlaceholder: true,
    isFeatured: true,
    images: [
      {
        file: "sets/02.jpeg",
        alt: "Crystal leaf-motif necklace and earrings with pink and green stones on green satin",
      },
    ],
    variants: [{ sku: "MJ-SET-002", initialStock: 3 }],
  },
  {
    slug: "crystal-pendant-stud-set",
    name: "Crystal Pendant & Stud Set",
    description:
      "A fine chain with a rectangular crystal pendant and matching stud earrings. An easy everyday set, presented in a gift box.",
    categories: ["sets"],
    priceCents: 4200,
    isPlaceholder: true,
    images: [
      {
        file: "sets/03.jpeg",
        alt: "Rectangular crystal pendant on a fine chain with matching studs in an ivory gift box",
      },
    ],
    variants: [{ sku: "MJ-SET-003", initialStock: 3 }],
  },
  {
    slug: "teardrop-pendant-stud-set",
    name: "Teardrop Pendant & Stud Set",
    description:
      "A fine chain with a teardrop crystal pendant and matching stud earrings, presented in a gift box.",
    categories: ["sets"],
    priceCents: 4200,
    isPlaceholder: true,
    images: [
      {
        file: "sets/04.jpeg",
        alt: "Teardrop crystal pendant on a fine chain with matching studs in an ivory gift box",
      },
    ],
    variants: [{ sku: "MJ-SET-004", initialStock: 3 }],
  },
  {
    slug: "long-haram-set",
    name: "Long Haram Set",
    description:
      "A long gold-tone haram necklace with a pendant centrepiece, paired with jhumka earrings. A traditional set for weddings and festivals.",
    categories: ["sets", "bridal"],
    priceCents: 11900,
    isPlaceholder: true,
    images: [
      {
        file: "sets/05-crop.jpeg",
        alt: "Long gold-tone haram necklace with pendant and matching jhumka earrings on a maroon bust",
      },
    ],
    variants: [{ sku: "MJ-SET-005", initialStock: 3 }],
  },
  {
    slug: "layered-temple-necklace-set",
    name: "Layered Temple Necklace Set",
    description:
      "A two-layer gold-tone temple necklace with pendant centrepieces and matching earrings. A rich bridal set.",
    categories: ["sets", "bridal"],
    priceCents: 14900,
    isPlaceholder: true,
    images: [
      {
        file: "sets/06-crop.jpeg",
        alt: "Two-layer gold-tone temple necklace with pendants and matching earrings on a maroon bust",
      },
    ],
    variants: [{ sku: "MJ-SET-006", initialStock: 3 }],
  },
  {
    slug: "green-bead-layered-necklace",
    name: "Green Bead Layered Necklace",
    description:
      "A multi-strand necklace of green beads with gold-tone and stone accents along each side.",
    categories: ["sets"],
    priceCents: 6900,
    isPlaceholder: true,
    images: [
      {
        file: "sets/07-crop.jpeg",
        alt: "Multi-strand green bead necklace with gold-tone accents on a maroon bust",
      },
    ],
    variants: [{ sku: "MJ-SET-007", initialStock: 3 }],
  },
];
