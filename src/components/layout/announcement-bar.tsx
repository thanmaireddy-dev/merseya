import { announcement } from "@/lib/site-config";

export function AnnouncementBar() {
  return (
    // Blush background + plum text = 7.2:1 contrast (WCAG AA).
    <div className="bg-blush px-4 py-2 text-center text-xs font-medium tracking-[0.2em] text-plum uppercase">
      {announcement}
    </div>
  );
}
