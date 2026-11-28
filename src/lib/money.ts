// Money is stored as integer cents (CAD). Formatting is the ONLY place where
// cents become dollars, and it never does arithmetic with floats.

const cad = new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD" });

/** 4800 → "$48.00" */
export function formatPrice(cents: number): string {
  return cad.format(cents / 100);
}
