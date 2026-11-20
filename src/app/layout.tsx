import type { Metadata } from "next";
import { Cormorant_Garamond, DM_Sans } from "next/font/google";
import "./globals.css";

// next/font downloads these fonts at BUILD time and serves them from our own
// domain: no request to Google from the visitor's browser, and no layout shift.
const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Merseya Jewellery",
    template: "%s | Merseya Jewellery", // e.g. "Earrings | Merseya Jewellery"
  },
  description:
    "Indian traditional and contemporary jewellery, shipped across Canada.",
};

// The ROOT layout: the only place that renders <html> and <body>.
// It is shared by the shop AND (later) the admin area, so it holds only
// what both need: fonts, global CSS and metadata. The shop's header and
// footer live in app/(shop)/layout.tsx instead.
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en-CA" className={`${cormorant.variable} ${dmSans.variable}`}>
      <body>{children}</body>
    </html>
  );
}
