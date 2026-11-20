"use client";
// A Client Component: it needs state (open/closed) and click handlers,
// which only exist in the browser. Everything else in the header stays
// a Server Component, so the JavaScript sent to phones stays small.

import Link from "next/link";
import { useEffect, useState } from "react";
import { categoryLinks, helpLinks } from "@/lib/site-config";

export function MobileNav() {
  const [open, setOpen] = useState(false);

  // Close the menu when the Escape key is pressed (keyboard accessibility).
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="mobile-menu"
        className="-ml-2 p-2 text-plum"
      >
        <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="size-6"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          {open ? (
            <path d="M6 6l12 12M18 6L6 18" />
          ) : (
            <path d="M4 7h16M4 12h16M4 17h16" />
          )}
        </svg>
      </button>

      {open && (
        <nav
          id="mobile-menu"
          aria-label="Mobile"
          className="absolute inset-x-0 top-full border-b border-blush bg-ivory px-6 pt-4 pb-8 shadow-sm"
        >
          <ul className="space-y-1">
            {categoryLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="block py-2 font-display text-xl text-plum"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <ul className="mt-6 space-y-1 border-t border-blush pt-6">
            {helpLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="block py-1.5 text-sm"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </div>
  );
}
