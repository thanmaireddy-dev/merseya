import { AnnouncementBar } from "@/components/layout/announcement-bar";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";

// Layout for every customer-facing page. "(shop)" is a ROUTE GROUP: the
// brackets mean the folder name is NOT part of the URL, so
// app/(shop)/page.tsx is still "/". The admin area (Phase 5) will live
// outside this group and get its own layout without the shop header.
export default function ShopLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      {/* Lets keyboard users jump past the navigation */}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:bg-ivory focus:px-4 focus:py-2"
      >
        Skip to content
      </a>
      <AnnouncementBar />
      <SiteHeader />
      <main id="main" className="min-h-[60vh]">
        {children}
      </main>
      <SiteFooter />
    </>
  );
}
