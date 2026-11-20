import { announcement } from "@/lib/site-config";

export function AnnouncementBar() {
  return (
    <div className="bg-deep-plum px-4 py-2 text-center text-xs font-medium tracking-[0.2em] text-ivory uppercase">
      {announcement}
    </div>
  );
}
