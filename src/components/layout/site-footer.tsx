import Image from "next/image";
import Link from "next/link";
import {
  aboutLinks,
  categoryLinks,
  helpLinks,
  type NavLink,
} from "@/lib/site-config";
import { cacheLife } from "next/cache";
import logo from "../../../public/images/brand/merseya-logo-blush.png";

// With Cache Components, reading the current time during rendering must be
// an explicit choice. "use cache" says: compute this once, reuse the result,
// and recompute it daily, which is plenty for a copyright year.
async function CopyrightYear() {
  "use cache";
  cacheLife("days");
  return new Date().getFullYear();
}

function FooterColumn({ title, links }: { title: string; links: NavLink[] }) {
  return (
    <div>
      {/* Champagne is readable only on deep plum (6:1), which is why it lives here */}
      <h2 className="font-sans text-xs font-medium tracking-[0.2em] text-champagne uppercase">
        {title}
      </h2>
      <ul className="mt-4 space-y-2.5">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="text-sm text-ivory/85 transition-colors hover:text-blush"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function SiteFooter() {
  return (
    <footer className="bg-deep-plum text-ivory">
      <div className="mx-auto grid max-w-7xl gap-12 px-6 py-16 md:grid-cols-4 md:px-8">
        <div>
          <Image
            src={logo}
            alt="Merseya Jewellery"
            className="h-28 w-auto"
            sizes="126px"
          />
          <p className="mt-6 max-w-xs text-sm text-ivory/85">
            Indian traditional and contemporary jewellery, based in Ontario
            and shipped across Canada.
          </p>
        </div>
        <FooterColumn title="Shop" links={categoryLinks} />
        <FooterColumn title="Help" links={helpLinks} />
        <FooterColumn title="About" links={aboutLinks} />
      </div>

      <div className="border-t border-champagne/40">
        <p className="mx-auto max-w-7xl px-6 py-6 text-xs text-ivory/70 md:px-8">
          © <CopyrightYear /> Merseya Jewellery. All prices in CAD.
        </p>
      </div>
    </footer>
  );
}
