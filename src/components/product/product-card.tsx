import Link from "next/link";
import { CloudinaryImage } from "@/components/ui/cloudinary-image";
import { formatPrice } from "@/lib/money";
import type { ProductSummary, StockState } from "@/server/catalogue";

function stockBadge(stock: StockState): string | null {
  if (stock.kind === "sold_out") return "Sold out";
  if (stock.kind === "low") return `Only ${stock.unitsLeft} left`;
  return null;
}

// A product in a grid: photo in a fixed 4:5 frame, name, price, stock badge.
// Server Component: it renders to plain HTML. Only the image's srcset logic
// (CloudinaryImage) is a Client Component.
export function ProductCard({
  product,
  sizes = "(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw",
  eager = false,
}: {
  product: ProductSummary;
  /** How wide the card is on screen, so the browser picks the right image size. */
  sizes?: string;
  /** Load immediately instead of lazily: use for the first row (above the fold),
   *  so the biggest visible image (LCP, a Core Web Vital) isn't delayed. */
  eager?: boolean;
}) {
  const badge = stockBadge(product.stock);
  const soldOut = product.stock.kind === "sold_out";

  return (
    <Link href={`/products/${product.slug}`} className="group block">
      {/* Photo frame. Blush shows only while the photo loads: once loaded,
          the photo fills the frame, so no pink competes with the jewellery. */}
      <div className="relative aspect-[4/5] overflow-hidden border border-transparent bg-blush/40 transition-colors duration-300 group-hover:border-rose">
        {product.image ? (
          <CloudinaryImage
            src={product.image.src}
            alt={product.image.alt}
            fill
            sizes={sizes}
            loading={eager ? "eager" : "lazy"}
            className={`object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03] ${soldOut ? "opacity-60" : ""}`}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs tracking-[0.2em] text-plum/70 uppercase">
            Photo coming soon
          </div>
        )}
        {badge && (
          <span className="absolute top-3 left-3 bg-blush px-2.5 py-1 text-[11px] font-medium tracking-[0.15em] text-plum uppercase">
            {badge}
          </span>
        )}
      </div>

      <h3 className="mt-4 text-xl leading-snug">{product.name}</h3>
      <p className="mt-1 text-sm text-charcoal">
        {product.hasPriceRange && "From "}
        {formatPrice(product.priceCents)}
      </p>
    </Link>
  );
}
