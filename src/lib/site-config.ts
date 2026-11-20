// Single source of truth for site-wide navigation and copy.
// Components read from here, so changing a link or the announcement
// text is a one-line edit.

export type NavLink = {
  label: string;
  href: string;
};

// The 6 final categories (plan.md §5.1 FR-2). The catalogue sync script
// (task 2.5) will reuse this list so the menu and the database agree.
export const categories = [
  { name: "Jewellery Sets", slug: "sets" },
  { name: "Earrings", slug: "earrings" },
  { name: "Bridal", slug: "bridal" },
  { name: "Rings", slug: "rings" },
  { name: "Hair Accessories", slug: "hair-accessories" },
  { name: "Mystery Boxes", slug: "mystery-boxes" },
] as const;

export const categoryLinks: NavLink[] = categories.map((c) => ({
  label: c.name,
  href: `/collections/${c.slug}`,
}));

// Only confirmed facts go here (CLAUDE.md §2). Final wording: plan.md P13.
export const announcement = "Shipping across Canada";

export const helpLinks: NavLink[] = [
  { label: "Shipping", href: "/shipping" },
  { label: "Returns & Damage Policy", href: "/returns" },
  { label: "Jewellery Care", href: "/care" },
  { label: "Ring Size Guide", href: "/ring-size-guide" },
  { label: "FAQ", href: "/faq" },
  { label: "Contact", href: "/contact" },
];

export const aboutLinks: NavLink[] = [
  { label: "About Merseya", href: "/about" },
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms of Service", href: "/terms" },
];
