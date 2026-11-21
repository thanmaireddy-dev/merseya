// Change the stock of ONE variant, identified by its SKU.
//
//   npm run stock:adjust -- MJ-EAR-001 +2     received 2 more
//   npm run stock:adjust -- MJ-EAR-001 -1     one damaged / given away
//   npm run stock:adjust -- MJ-EAR-001 =5     after a physical count
//   add --prod to change PRODUCTION (typed confirmation)
//
// "+n" and "-n" are applied by the DATABASE as an atomic increment, so a sale
// processed at the same moment can't be lost. "=n" overwrites the value, so
// use it only after counting what's physically on the shelf.

import { loadScriptEnv } from "./lib/script-env";

const [sku, change] = process.argv.slice(2).filter((a) => a !== "--prod");
const match = change?.match(/^([+-]|=)(\d+)$/);

if (!sku || !match) {
  console.error("Usage: npm run stock:adjust -- <SKU> <+n | -n | =n> [--prod]");
  process.exit(1);
}
const [, op, digits] = match;
const amount = Number(digits);

async function main() {
  await loadScriptEnv(`change stock of ${sku}`);
  const { db } = await import("../src/lib/db");

  const before = await db.variant.findUnique({
    where: { sku },
    include: { product: { select: { name: true } } },
  });
  if (!before) {
    console.error(`✖ No variant with SKU ${sku}.`);
    process.exit(1);
  }

  const data =
    op === "=" ? { stock: amount }
    : op === "+" ? { stock: { increment: amount } }
    : { stock: { decrement: amount } };

  const after = await db.variant.update({ where: { sku }, data });
  const label = before.label ? ` (${before.label})` : "";
  console.log(`✔ ${before.product.name}${label} [${sku}]: stock ${before.stock} → ${after.stock}`);
  if (after.stock < 0) console.log("  ⚠ Stock is negative: orders exceed what you have. Restock or refund.");
  await db.$disconnect();
}

main().catch((err) => {
  console.error("✖ Failed:", err instanceof Error ? err.message : err);
  process.exit(1);
});
