import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Merseya Jewellery",
  description:
    "Indian traditional and contemporary jewellery, shipped across Canada.",
};

// The root layout wraps every page. It must render <html> and <body>.
// `LayoutProps<"/">` is a type that Next.js generates from our routes.
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en-CA">
      <body>{children}</body>
    </html>
  );
}
