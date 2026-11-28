// TEMPORARY: development preview of every product card. Replaced by the real
// collection pages in task 3.2, then deleted. Never shown in production.

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductCard } from "@/components/product/product-card";
import { getAllProducts } from "@/server/catalogue";

export const metadata: Metadata = {
  title: "Product card preview",
  robots: { index: false, follow: false }, // keep search engines away
};

export default async function ProductCardPreviewPage() {
  // VERCEL_ENV is "production" only on the live deployment (local dev and previews differ).
  if (process.env.VERCEL_ENV === "production") notFound();

  const products = await getAllProducts();

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 md:px-8">
      <p className="text-xs tracking-[0.2em] text-plum uppercase">Development preview</p>
      <h1 className="mt-2 text-4xl">All products ({products.length})</h1>
      <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 lg:grid-cols-4 lg:gap-x-8">
        {products.map((p, i) => (
          <ProductCard key={p.slug} product={p} eager={i < 4} />
        ))}
      </div>
    </section>
  );
}
