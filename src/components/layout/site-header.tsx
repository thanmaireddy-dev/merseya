import Image from "next/image";
import Link from "next/link";
import { categoryLinks } from "@/lib/site-config";
import { MobileNav } from "./mobile-nav";
import logo from "../../../public/images/brand/merseya-logo-plum.png";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-blush bg-ivory">
      {/* Row 1: menu (mobile) · logo (centre) · cart */}
      <div className="relative mx-auto grid max-w-7xl grid-cols-3 items-center px-4 py-3 md:px-8">
        <div className="justify-self-start">
          <MobileNav />
        </div>

        <Link href="/" className="justify-self-center">
          {/* Static import: Next.js knows the image size at build time,
              so it reserves space (no layout shift) and serves resized
              WebP/AVIF versions instead of the 2400px original. */}
          <Image
            src={logo}
            alt="Merseya Jewellery, home"
            preload // Next 16: replaces the deprecated `priority` prop
            className="h-16 w-auto md:h-24"
            sizes="(min-width: 768px) 108px, 72px"
          />
        </Link>

        <Link
          href="/cart"
          className="-mr-2 justify-self-end p-2 text-plum"
        >
          <span className="sr-only">Shopping bag</span>
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className="size-6"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path d="M5 8h14l-1.2 12H6.2L5 8z" />
            <path d="M9 8V6a3 3 0 016 0v2" />
          </svg>
        </Link>
      </div>

      {/* Row 2: category navigation (tablet & desktop) */}
      <nav aria-label="Categories" className="hidden md:block">
        <ul className="mx-auto flex max-w-7xl justify-center gap-8 px-8 pb-3 text-xs font-medium tracking-[0.18em] uppercase">
          {categoryLinks.map((link) => (
            <li key={link.href}>
              {/* Rose underline on hover: rose is a UI line here, never small text */}
              <Link
                href={link.href}
                className="border-b border-transparent pb-1 text-charcoal transition-colors duration-200 hover:border-rose hover:text-plum"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
