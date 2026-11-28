# Merseya Jewellery — Project Plan

> **Status:** v1, APPROVED by the developer. 🟡 tech choices in §8 confirmed. Progress is tracked by phase (§18), not by date.
> **Target launch:** 15 December 2026 (business goal)
> **Owner of this document:** developer (Thanmai). Update it whenever a decision changes.
>
> Legend: ✅ Decided · 🟡 Proposed (recommended, not yet confirmed) · ⏳ Pending (blocked on information)

---

## 1. Project overview

Merseya is a custom-built online store for **Merseya Jewellery**, an Ontario-based boutique selling Indian traditional and contemporary imitation / gold-plated jewellery to customers across Canada.

The application is a single **Next.js full-stack** web app that lets customers browse a small curated catalogue, add items to a cart, pay securely through **Stripe Checkout** in CAD, and receive email confirmations. The business owner sees and fulfils paid orders through a small, secured **orders-only admin area**. Products and stock are maintained by the developer through validated scripts.

## 2. Business context

| Item | Detail |
|---|---|
| Business | Merseya Jewellery (online only) — Ontario, Canada |
| Products | Imitation / 1-gram gold / gold-plated jewellery on base metals (copper, brass, alloys). **Not solid gold.** |
| Promise | Anti-tarnish coating (exact wording ⏳ — must be supportable by supplier information) |
| Market | Ships to all Canadian provinces and territories. No local pickup. CAD only. |
| Fulfilment | Client packs and ships from home using a shipping service (carrier ⏳) |
| Catalogue at launch | ~20 products, ~3 units each, 6 categories (✅ final names in §5.1 FR-2); a product may belong to several categories |
| Legal / tax | Business registration in progress. GST/HST status ⏳. No Stripe account yet. |
| Ownership | ✅ The business owns Stripe, domain, business email and hosting; developer is invited as a collaborator. All service accounts (Vercel, Neon, Cloudinary, Resend, Stripe) are registered with the business's Gmail account. |

## 3. Project objectives

1. Launch a **secure, reliable, attractive MVP** that can take real payments.
2. Keep **orders, payments and stock consistent** in the database at all times.
3. Present products **honestly** (materials, plating, dimensions, care) and build trust.
4. Let the client fulfil orders **without depending on the developer**.
5. Keep the system simple enough that one student developer understands and maintains all of it.
6. Make the developer able to explain every architectural decision in a technical interview.

## 4. Target audience

- **Shoppers:** Indian women in Canada and the wider multicultural community, ~20–40, mostly on mobile, often arriving from Instagram/WhatsApp. Want affordable, elegant pieces for everyday wear, festivals and weddings.
- **Business owner (client):** non-technical; needs to see new orders, print packing details, enter tracking numbers.
- **Developer:** maintains catalogue, stock, code, deployment.

## 5. Functional requirements

### 5.1 Storefront (customers)
- FR-1 Homepage: hero, featured categories, best sellers, brand story, trust points (anti-tarnish, shipping across Canada), announcement bar.
- FR-2 Category (collection) pages at `/collections/<slug>` with sort (newest, price) and a simple "in stock" filter. ✅ Final categories:

  | Name | Slug |
  |---|---|
  | Jewellery Sets | `sets` |
  | Earrings | `earrings` |
  | Bridal | `bridal` |
  | Rings | `rings` |
  | Hair Accessories | `hair-accessories` |
  | Mystery Boxes | `mystery-boxes` |

  A product can appear in more than one category (e.g. a bridal necklace set is in both Jewellery Sets and Bridal).
- FR-3 Product detail page: image gallery, price in CAD, stock state ("Only 1 left", "Sold out"), ring size selector (rings only), structured specifications (base metal, finish/plating, dimensions, weight where known, care), mystery box contents list, shipping & policy summary.
- FR-4 Cart: add/remove/change quantity, persisted in the browser, shows subtotal and shipping note; quantities capped by available stock.
- FR-5 Checkout via Stripe Checkout (hosted) in CAD; collect email, name, phone, Canadian shipping address; flat shipping rates; terms-of-service consent checkbox.
- FR-6 Order confirmation page that reads the order status from our database (never trusts the redirect alone).
- FR-7 Emails: order confirmation to customer, new-order alert to business, "shipped" email with tracking to customer.
- FR-8 Content pages: About, Shipping, Returns & Damage Policy, Jewellery Care, Ring Size Guide, FAQ, Contact (email + social links), Privacy Policy, Terms.

### 5.2 Orders admin (client) — ✅ in launch scope (may follow immediately after launch if needed, see §18 Phase 5)
- FR-9 Sign in with Google, allowed only for an allowlist of business email addresses.
- FR-10 Orders list filtered by status (Paid / Shipped / Needs attention / All).
- FR-11 Order detail + printable packing slip (items, SKU, ring size, quantity, customer name, phone, address).
- FR-12 "Mark as shipped" with carrier + tracking number → updates status, sends shipped email.

### 5.3 Catalogue & stock management (developer, no UI)
- FR-13 Product content kept in a version-controlled catalogue file; `catalog:sync` validates and upserts into the database.
- FR-14 Stock changed only through a `stock:adjust` script (never overwritten by catalogue sync).
- FR-15 Products are deactivated, never hard-deleted (orders reference them).

### 5.4 Payments & orders (system)
- FR-16 Server-side price and stock validation before creating a checkout session.
- FR-17 Stripe webhook is the only thing that marks an order PAID.
- FR-18 Idempotent processing of duplicate/retried webhook events.
- FR-19 Stock decremented atomically on payment; oversells accepted, flagged `needsAttention`, business alerted.
- FR-20 Expired/abandoned checkouts marked EXPIRED; refunds and disputes reflected in order status.

## 6. Non-functional requirements

| Area | Requirement |
|---|---|
| Security | No secrets in client code or Git; webhook signatures verified; admin checks on every admin page and action; no card data ever touches our servers. |
| Privacy | Collect only data needed to fulfil orders (PIPEDA principles). Customer data only in DB, Stripe and business inbox. |
| Performance | Product pages server-rendered; images resized/optimised; good mobile Lighthouse scores (target ≥ 85 performance, ≥ 95 accessibility). |
| Accessibility | WCAG 2.1 AA colour contrast, keyboard navigation, alt text on all product images, visible focus states. |
| Reliability | Orders survive browser closes; webhook retries are safe; database has point-in-time restore. |
| Maintainability | TypeScript, small modules, consistent naming, documented scripts. |
| Honesty | No invented reviews, warranties, certifications, or inflated "value" claims. |

## 7. MVP scope

### 7.1 Must have for launch
Storefront (FR-1 → FR-8), payments & orders (FR-16 → FR-20), catalogue scripts (FR-13 → FR-15), customer + business emails, legal/policy pages with client-approved text, deployment on the production domain with Stripe live mode.

### 7.2 Launch target, may follow immediately after launch
Orders admin (FR-9 → FR-12). **Fallback:** client works from the new-order email + Stripe dashboard and emails tracking manually; developer back-fills statuses with a script.

### 7.3 Deferred (future versions)
| Feature | Why deferred |
|---|---|
| Product/stock admin UI | Developer manages ~20 products; revisit when client needs independence — **first post-launch priority after orders admin** |
| Customer accounts, order history, saved addresses | Guest checkout is enough; schema allows adding later |
| Search | 20 products — category browsing is enough |
| Contact form | Email link avoids spam handling |
| Discount codes | Stripe supports them natively; add when marketing needs them |
| Reviews | Only real reviews, once real customers exist |
| Wishlist, newsletter (CASL), back-in-stock alerts | Marketing features after launch |
| Carrier API / label printing | Flat rates are enough at this volume |
| Stock reservation during checkout | Overselling is tolerated and rare at this scale |
| US / international shipping | Canada first |

## 8. Technology stack

| Layer | Choice | Status | Role |
|---|---|---|---|
| Framework | **Next.js (App Router)**, current stable version at setup | ✅ | Pages, server logic, webhook endpoint — one app, one deployment |
| Language | **TypeScript** | ✅ | Type safety for money, orders and Stripe objects |
| Styling | **Tailwind CSS** with brand tokens defined in CSS | 🟡 | Fast, consistent styling; tokens map to the brand palette |
| Fonts | **Cormorant Garamond** (headings), **DM Sans** (body) via `next/font` | ✅ | Self-hosted at build time, no layout shift |
| Database | **PostgreSQL** on **Neon** | ✅ / 🟡 | Relational data + transactions; Neon = managed, branching for dev/preview |
| ORM | **Prisma 7.10.1** (pinned exactly) + `@prisma/adapter-pg` | ✅ | Schema, migrations, generated types. Pinned because npm's `latest` tag pointed at an 8.0 release candidate |
| Validation | **Zod** | 🟡 | Validate catalogue data, server action input, env vars |
| Payments | **Stripe Checkout** (hosted) + webhooks | ✅ | Card handling, 3-D Secure, Apple/Google Pay |
| Tax | Stripe Tax *or* no tax | ⏳ | Depends on GST/HST registration (accountant) |
| Images | **Cloudinary** (free tier) | 🟡 | Hosting + automatic resizing/format |
| Email | **Resend** (free tier) + React Email templates | 🟡 | Transactional emails from the business domain |
| Admin auth | **Auth.js** with Google provider, JWT sessions, email allowlist | 🟡 | No passwords stored; no auth tables needed |
| Hosting | **Vercel Pro** (owned by business) | 🟡 | Hobby plan forbids commercial use |
| Testing | **Vitest** (unit/integration) + Stripe CLI + manual test checklist | 🟡 | See §17 |
| Source control | Git + GitHub (`thanmaireddy-dev/merseya`) | ✅ | Backup, history, PR-based workflow, Vercel previews |

**Explicitly not used:** separate Express backend, MongoDB, Redis, queues, microservices, Docker, customer auth, CMS.

## 9. Architecture overview

```
                    ┌────────────────────────── Vercel ──────────────────────────┐
 Customer browser ──►  Next.js app                                               │
  (cart in           │   • Server Components  → read catalogue from PostgreSQL   │
   localStorage)     │   • Client Components  → cart, gallery, size picker       │
        │            │   • Server Actions     → startCheckout, markShipped       │
        │            │   • Route Handler      → POST /api/webhooks/stripe ◄──────┼── Stripe
        │            │   • /admin/* (Auth.js, allowlist)                          │
        │            └───────┬───────────────────────┬────────────────────┬──────┘
        │                    │ Prisma                │ Resend API         │ image URLs
        │                    ▼                       ▼                    ▼
        │             PostgreSQL (Neon)        Customer / business    Cloudinary
        │                                      inboxes
        └──► Stripe-hosted Checkout page (card data never reaches us)

 Developer laptop ── npm run catalog:sync / stock:adjust ──► PostgreSQL (prod only with --prod)
```

**Key principles**
- The **database is the source of truth** for products, prices, stock and orders. Stripe is the source of truth for whether money moved.
- **Server decides prices.** The browser only ever sends `variantId` + `quantity`.
- **Webhooks, not redirects,** confirm payment.
- **No public API.** Nothing outside our own app needs our data.

### 9.1 Proposed folder structure (finalised in Phase 2)
```
src/
  app/
    (shop)/            homepage, collections/[slug], products/[slug], cart, checkout/success, content pages
    admin/             orders list, order detail, packing slip
    api/webhooks/stripe/route.ts
    api/auth/[...nextauth]/route.ts
  components/          UI components (ui/ for primitives, shop/, admin/)
  lib/                 db.ts, stripe.ts, email.ts, money.ts, env.ts, auth.ts
  server/              checkout.ts, orders.ts, inventory.ts  (business logic, server-only)
  emails/              React Email templates
catalog/               products.ts (catalogue content), categories.ts
scripts/               catalog-sync.ts, stock-adjust.ts, order-ship.ts (fallback)
prisma/                schema.prisma, migrations/
docs/                  brand/, interview-notes.md, runbook.md (later)
```

## 10. Database planning

All money stored as **integer cents (CAD)** — never floats.

### 10.1 Entities (draft)

**Category** — `id, slug (unique), name, description, sortOrder, isActive`

**ProductCategory** (join table, many-to-many) — `productId → Product, categoryId → Category, sortOrder` · primary key `(productId, categoryId)` · `sortOrder` lets each collection page order its products independently.

**Product** — `id, slug (unique), name, description, priceCents, baseMaterial, finish (plating), dimensions, weightGrams?, careNotes?, contents[]? (mystery boxes), isActive, isFeatured, createdAt, updatedAt`

**ProductImage** — `id, productId → Product, cloudinaryPublicId, alt, sortOrder`

**Variant** — `id, productId → Product, sku (unique), label? (e.g. "Size 7"; null for default), ringSize?, priceCentsOverride?, stock (int ≥ 0 normally), isActive, sortOrder`
→ **Every product has ≥ 1 variant.** Non-ring products have one hidden default variant. Stock lives on the variant.

**Order** — `id, orderNumber (unique, human-friendly e.g. MJ-1001), status, needsAttention, attentionReason?, email, customerName, phone, shipping address fields (line1, line2, city, province, postalCode, country), subtotalCents, shippingCents, taxCents, totalCents, currency, shippingRateName, stripeCheckoutSessionId (unique), stripePaymentIntentId? (unique), paidAt?, shippedAt?, carrier?, trackingNumber?, confirmationEmailSentAt?, businessAlertSentAt?, shippedEmailSentAt?, createdAt, updatedAt, userId? (future)`

**OrderItem** — `id, orderId → Order, variantId → Variant (restrict delete), productNameSnapshot, variantLabelSnapshot, skuSnapshot, unitPriceCents, quantity, imageSnapshot`
→ Snapshots keep historical orders correct even if prices or names change later.

**StripeEvent** — `id (Stripe event id, PK), type, receivedAt` — log of processed events (duplicate protection + audit).

### 10.2 Order status lifecycle
```
PENDING ──(checkout.session.completed, paid)──► PAID ──(admin: mark shipped)──► SHIPPED
   │                                              │
   └──(checkout.session.expired)──► EXPIRED       └──(charge.refunded, full)──► REFUNDED
needsAttention flag (independent): oversell, dispute opened, partial refund, email failure
```
Transitions are enforced in code with **conditional updates** (`UPDATE … WHERE status = 'PENDING'`), which is what makes webhook retries safe.

### 10.3 Future-proofing
Customer accounts later = add `User` table + nullable `Order.userId`; link past guest orders by verified email. No restructuring required.

## 11. API / server logic planning

| Kind | Name | Caller | Purpose |
|---|---|---|---|
| Server Component data | `getCategories`, `getProductsByCategory`, `getProductBySlug`, `getVariantsForCart` | Our pages | Read-only catalogue queries |
| Server Action | `startCheckout(items)` | Cart page | Validate → create PENDING order → create Stripe session → return redirect URL |
| Server Action | `markOrderShipped(orderId, carrier, tracking)` | Admin | Auth check → PAID→SHIPPED → shipped email |
| Route Handler | `POST /api/webhooks/stripe` | Stripe | Verify signature → process events |
| Route Handler | `/api/auth/*` | Auth.js | Google sign-in for admin |
| Script | `catalog:sync [--prod]` | Developer | Validate catalogue file, upsert categories/products/variants/images |
| Script | `stock:adjust <sku> <+n/-n/=n> [--prod]` | Developer | Change stock with confirmation prompt |
| Script | `order:ship <orderNo> <carrier> <tracking> [--prod]` | Developer | Fallback if admin slips |

Webhook events handled: `checkout.session.completed`, `checkout.session.expired`, `charge.refunded`, `charge.dispute.created`.

## 12. Stripe payment architecture

### 12.1 Lifecycle
1. **Customer clicks Checkout.** Browser sends `[{variantId, quantity}]` to `startCheckout`.
2. **Server validates.** Loads variants; rejects inactive or zero-stock items; computes totals from DB prices.
3. **Server creates a PENDING order** with item snapshots, then a **Stripe Checkout Session**: `mode: payment`, `currency: cad`, line items via `price_data`, `metadata.orderId`, `client_reference_id`, `shipping_address_collection: { allowed_countries: ['CA'] }`, phone collection, fixed `shipping_options` with delivery estimates, terms consent, `expires_at` = 30 min, automatic tax ⏳. Session id saved on the order.
4. **Customer pays on Stripe's page.** Declines and 3-D Secure are handled by Stripe; card data never reaches us.
5. **Stripe redirects to `/checkout/success?session_id=…`.** Page shows the order from our DB: "Confirmed" if PAID, otherwise "Confirming your payment…" (refreshes). **It never changes order state.**
6. **Stripe POSTs `checkout.session.completed` to our webhook.** Handler:
   - reads raw body, verifies `Stripe-Signature` with the webhook secret (rejects otherwise);
   - in one DB transaction: record event id; `PENDING → PAID` only if still PENDING; save customer + address from the session; decrement stock per variant with a conditional update; if stock would go below zero → still decrement to track oversell, set `needsAttention` + reason;
   - after commit: send customer confirmation + business alert if their `…SentAt` fields are null, then set them;
   - returns 2xx. Any failure → 5xx → Stripe retries (up to ~3 days), and the steps above are safe to repeat.
7. **Browser closed after paying:** webhook still arrives → order still PAID → email still sent.
8. **Cancel/abandon:** customer returns to cart; session expires → `checkout.session.expired` → order EXPIRED. No stock was touched.
9. **Refunds/disputes:** done by the business in the Stripe dashboard → webhooks update status / flag the order.

### 12.2 Environments & keys
| Environment | Stripe mode | Webhook delivery |
|---|---|---|
| Local | Test | Stripe CLI `stripe listen --forward-to localhost:3000/api/webhooks/stripe` |
| Preview (Vercel) | Test | Test-mode webhook endpoint |
| Production | Live (only after go-live checklist) | Live-mode webhook endpoint with its own secret |

Secret key and webhook secret only in server env vars. Publishable key not needed (hosted Checkout).

### 12.3 Shipping in Checkout
Flat-rate options defined in code/config (e.g. "Standard tracked — Canada", free above a threshold), each with a delivery estimate. Values ⏳ until carrier quotes arrive.

## 13. Security considerations

- `.env*` in `.gitignore`; env vars validated at startup with Zod; separate secrets per environment.
- Webhook signature verification; reject unsigned/old events.
- Server-side pricing and stock checks; never trust client prices or totals.
- Admin: Auth.js Google sign-in + allowlist; **authorisation check inside every admin page and server action** (not only middleware — defence in depth).
- Prisma parameterised queries (no SQL injection); Zod validation on every server action input.
- Production DB credentials only in Vercel and the developer's local `.env` used with explicit `--prod`; scripts require confirmation.
- Security headers (CSP where practical, HSTS via Vercel), HTTPS only.
- No card data stored or logged; avoid logging personal data.
- Neon point-in-time restore enabled on the production branch; manual `pg_dump` before any production migration.
- **Never run destructive DB commands on production without explicit approval and a verified backup.**

## 14. UI/UX and branding requirements

### 14.1 Tokens & colour direction
Merseya is a **plum, blush-pink and ivory** brand. Blush must be clearly visible, not just a tiny accent. The full rules, contrast limits and things to avoid are in `CLAUDE.md` §4.

| Token | HEX | Use | Approx. share |
|---|---|---|---|
| `ivory` | #F7F3EF | Main background | ~35% |
| `blush` | #F0DDE1 | Section bands, panels, badges, mobile menu | ~25% |
| `rose` | #B77D84 | Borders, underlines, hover states, icons, large display accents (**never small text**) | ~15% |
| `plum` | #683844 | Brand colour, headings, links | ~15% |
| `deep-plum` | #422133 | Primary buttons, footer, campaign sections | ~7% |
| `charcoal` | #30272B | Body text | — |
| `champagne` | #C6A477 | Restrained gold details (text only on deep plum) | ~3% |

### 14.2 Typography
Cormorant Garamond for headings/display; DM Sans for body, UI, prices; restrained uppercase DM Sans with letter-spacing for labels.

### 14.3 Layout direction (from client-approved reference)
Editorial hero → best sellers row with prices → brand story with three pillars → campaign image band in deep plum. Generous whitespace, product photography first, subtle hover transitions only. Adapted: ivory background (not grey-blue), prices as `$48.00 CAD`, **no testimonials until real ones exist**.

### 14.4 Assets
- Logo ✅ final: transparent PNGs in `public/images/brand/` (plum lockup, blush lockup, MJ monogram tile). Use as supplied, never recolour. See `docs/brand/README.md`.
- Photos: real product photography only; consistent background and aspect ratio (proposed 4:5), at least 2 images per product, one showing scale/wear where possible. No AI-generated product images.
- Brand files in `docs/brand/`; third-party inspiration images in `docs/brand/references/` are git-ignored (public repo).

### 14.5 Content honesty
Structured spec fields on every product; mystery boxes list number and types of items without unsupported "worth $X" claims; anti-tarnish wording defined once in a shared component and approved before launch.

## 15. Policies (business content — client approves final text)

**Returns & damage policy (agreed direction):**
- No returns, exchanges, or change-of-mind refunds. Rings are final sale (Canadian ring sizes + size guide).
- Damaged item **or wrong item sent** → replacement after verification.
- Tracked parcel **lost in transit** → replacement or refund.
- Replacement **unavailable** → refund.
- Claim within 48–72 h of delivery (exact window ⏳) with order number and photos; unboxing video **strongly recommended**.
- Policy shown on product pages, cart, policy page, and accepted via the Stripe Checkout terms checkbox.
- Final wording reviewed by a qualified advisor (⏳). Claude drafts templates; it does not provide legal advice.

## 16. Deployment considerations

| Item | Plan | Est. monthly cost |
|---|---|---|
| App hosting | Vercel Pro, team owned by the business | ~US$20 (≈CA$28) |
| Database | Neon — free during development; paid plan with longer restore window from launch | US$0 → ~US$5–15 |
| Images | Cloudinary free tier | $0 |
| Email sending | Resend free tier (3,000/month, 100/day) | $0 |
| Domain | `merseya.ca` registered **by the client/business** (Canadian Presence Requirements) | ~CA$1 amortised |
| Business email | Google Workspace or Zoho (⏳) | $0–10 |
| Monitoring | Vercel logs, Stripe failed-webhook alerts, free uptime monitor | $0 |
| **Fixed total** | | **≈ CA$30–55** |
| Per order | Stripe ~2.9% + CA$0.30 domestic (+0.8% intl cards; +0.5% if Stripe Tax) | usage-based |

All prices to be re-verified on provider sites when accounts are created.

## 17. Testing strategy

- **Unit tests (Vitest):** money/total calculations, cart validation, catalogue schema validation, order status transitions.
- **Integration tests (Vitest + test DB branch):** webhook handler — paid event, duplicate event, out-of-order/expired event, oversell flagging, refund.
- **Stripe CLI:** replay events (`stripe trigger`, `stripe events resend`) against local and preview.
- **Manual payment checklist (test mode):** success card, declined card, 3-D Secure card, cancel, abandon until expiry, close tab after paying, double-click checkout, two buyers for last unit.
- **Manual UI checklist:** iPhone Safari + Android Chrome, keyboard-only navigation, contrast, all links/policies.
- **Live-mode verification:** one real low-value purchase on production, confirm order + emails + stock, then refund it and confirm REFUNDED.

## 18. Development phases

Progress is tracked **by phase and task, not by dates.** Each phase lists:
- the **setup prerequisites** that must be done before the phase (or a specific task) can start;
- the tasks in order;
- the deliverable and acceptance criteria;
- what the developer learns.

Each task is sized for one or two sessions and ends with a Git handoff (see `CLAUDE.md`). The launch target is in the header; when time is short, scope gets cut, never quality.

Status: ✅ done · 🔄 in progress · ⬜ not started

### Overview
| Phase | Goal | Status |
|---|---|---|
| 1. Discovery & planning | Requirements, decisions, this plan | ✅ |
| 2. Foundation | Working app skeleton, brand shell, database, catalogue scripts, first deploy | ✅ |
| 3. Storefront | Customers can browse products and fill a cart | 🔄 |
| 4. Checkout & orders | Customers can pay (test mode); orders, stock and emails are correct | ⬜ |
| 5. Orders admin | Client can see and fulfil orders herself | ⬜ |
| 6. Hardening & launch | Tested, configured for production, live payments | ⬜ |
| 7. Post-launch | Improvements based on real use (see §7.3) | ⬜ |

---

### Phase 1: Discovery & planning ✅
Deliverable: the approved `plan.md`, `CLAUDE.md`, and the GitHub repo connected.

### Phase 2: Foundation ✅
**Setup prerequisites**
| Needed before | Setup | Who | Output to share with Claude | Status |
|---|---|---|---|---|
| 2.1 | GitHub repo + `gh` signed in | Developer | — | ✅ |
| 2.4 | Neon project `Merseya` (AWS US East 2, Ohio), branches `production` and `dev` | Developer (business Gmail) | Branch names only; connection strings go into `.env` | ✅ |
| 2.5 | Cloudinary account | Developer (business Gmail) | Cloud name; the API key and secret go into `.env` | ✅ |
| 2.5 | Real photos and details for the first sample products | Client → developer | Photos stored locally (not committed) | ✅ photos ready |
| 2.6 | Vercel account, GitHub connected in Authentication settings | Developer (business Gmail) | Team name | ✅ |

**Tasks**
| # | Task | Status |
|---|---|---|
| 2.1 | Scaffold Next.js 16 + TypeScript + Tailwind | ✅ |
| 2.2 | Brand tokens, fonts, favicon, layout shell (announcement bar, header, footer), `(shop)` route group | ✅ |
| 2.3 | Environment config: `.env.example` + Zod-validated env module | ✅ |
| 2.4 | Prisma + Neon: schema from §10, first migration on `dev` | ✅ |
| 2.5a | Catalogue file + schema, `catalog:sync` (validate → upload to Cloudinary → per-product transactions) and `stock:adjust`, `--prod` safeguard; 6 categories synced to `dev` | ✅ |
| 2.5b | Load **placeholder** products for development and the client demo (`isPlaceholder: true`, sample names/prices, non-final photos). Real, verified details and final photos replace them before Phase 6; `catalog:sync --prod` refuses to run while any placeholder remains | ✅ |
| 2.6 | Vercel import + first preview deploy; Preview env vars (Neon `dev`); `README.md`; start `docs/interview-notes.md` | ✅ |

- **Deliverable:** a preview URL showing the branded shell; the `dev` database holds the 6 categories and the sample products. One PR for the whole phase.
- **Acceptance:** lint, type check and build pass; the app runs locally and on Vercel; `catalog:sync` is safe to re-run; no secrets in Git.
- **Learn:** App Router structure, route groups, layouts, `next/font`, design tokens, env vars, Prisma migrations, relational modelling, Git branches and PRs.
- **Interview:** *Why Postgres over MongoDB? Why store money as integer cents? What is a migration? Why does every product have a variant? What is a route group?*

### Phase 3: Storefront 🔄
**Setup prerequisites:** Cloudinary ✅. Placeholder products loaded ✅. **Before the first PR that reads the database during the build:** production database set up (task 3.0b).

**Build order** (dependency order; one branch + PR per task): 3.0 → 3.2 → 3.3 → 3.1 → 3.4 → 3.5. The client demo is possible after 3.1.

| # | Task |
|---|---|
| 3.0a | Database-target guard: `EnvironmentMarker` table (CHECK constraints), `db:mark`, checks in `catalog:sync` / `stock:adjust` ✅ |
| 3.0b | Production database: `.env.prod`, `db:deploy`, `db:mark -- production --prod`, Vercel Production env vars (P17) ✅ |
| 3.0c | Data layer `src/server/catalogue.ts` (cached, tag `catalogue`), Cloudinary loader via `CloudinaryImage` (Cloudinary resizes, not Vercel), `ProductCard` (4:5, stock badges), temporary `/dev/products` preview ✅ |
| 3.1 | Homepage (hero, featured categories, best sellers, brand story, trust points) |
| 3.2 | Collection pages `/collections/[slug]` with sort and an in-stock filter |
| 3.3 | Product page: gallery, specs, ring size selector, stock state |
| 3.4 | Cart (localStorage + server re-validation of prices and stock) |
| 3.5 | Content pages (About, Shipping, Returns & Damage, Care, Ring Size Guide, FAQ, Contact, Privacy, Terms). Any copy not yet supplied by the client is clearly marked as a placeholder |

- **Deliverable:** the catalogue and cart are browsable on the preview URL.
- **Acceptance:** all categories can be browsed and products viewed and added to the cart on mobile and desktop; contrast meets WCAG AA; no invented claims.
- **Learn:** Server vs Client Components, Cache Components (`"use cache"`), `next/image`, accessibility basics.
- **Interview:** *What runs on the server and what runs in the browser? How does caching work in your app? Why isn't the cart in the database?*

### Phase 4: Checkout & orders ⬜
**Setup prerequisites**
| Needed before | Setup | Who | Output to share with Claude |
|---|---|---|---|
| 4.1 | Stripe account, **country Canada**, test mode, 2FA (do **not** activate until the business is registered) | Client/developer (business Gmail) | Confirmation only; the test secret key goes into `.env` |
| 4.2 | Stripe CLI installed locally | Claude (with approval) | — |
| 4.5 | Resend account | Developer (business Gmail) | Confirmation; the API key goes into `.env` |
| 4.1 | Provisional shipping rates (P2) | Client | Rates and delivery estimates |

| # | Task |
|---|---|
| 4.1 | `startCheckout` Server Action: validate the cart, create a PENDING order, create the Stripe Checkout Session |
| 4.2 | Webhook handler: signature check, idempotency, PAID transition, stock decrement, oversell flag, then `revalidateTag("catalogue")` so stock badges update immediately (cached catalogue otherwise lags up to an hour) |
| 4.3 | Success page that reads order status from the DB |
| 4.4 | Expired / refunded / disputed events |
| 4.5 | Emails: customer confirmation and business new-order alert (Resend + React Email) |
| 4.6 | Vitest integration tests for the webhook + the manual payment checklist (§17) |

- **Deliverable:** paid test orders are recorded via webhook, with emails sent.
- **Acceptance:** the full test-mode payment checklist passes; duplicate events have no extra effect; closing the tab after paying still produces a PAID order and its email.
- **Learn:** webhooks, HMAC signatures, idempotency, transactions, conditional updates, race conditions.
- **Interview:** *Walk through your payment flow. Why not trust the success page? How do you handle duplicate webhooks? What happens if two people buy the last item?*

### Phase 5: Orders admin ⬜
**Setup prerequisites:** a Google Cloud project with an OAuth client (Claude provides a guide). The Google account(s) allowed into the admin (P11).

| # | Task |
|---|---|
| 5.1 | Auth.js with Google, email allowlist, protected `/admin` layout |
| 5.2 | Orders list, order detail, printable packing slip |
| 5.3 | `markOrderShipped` + shipped email |

- **Deliverable:** the client can fulfil orders from `/admin`. If time is short, this phase may follow immediately after launch, using the email + Stripe dashboard fallback (§7.2).
- **Acceptance:** only allowlisted accounts can reach admin pages or actions, even when calling an action directly.
- **Learn:** authentication vs authorisation, OAuth, JWT sessions, defence in depth.
- **Interview:** *How is the admin protected? Why check auth inside the action and not only in middleware?*

### Phase 6: Hardening & launch ⬜
**Setup prerequisites (launch blockers):**
- business registered and Stripe activated (P8);
- tax decision (P1);
- domain `merseya.ca` (P7) and business email (P6);
- Vercel Pro billing approved by the client (P15);
- final policies (P4), shipping (P2), anti-tarnish wording (P3), business address (P5), site copy (P13);
- full catalogue data (P12).

| # | Task |
|---|---|
| 6.1 | Load the full catalogue and verify stock counts |
| 6.2 | Test checklists, accessibility and mobile checks, Lighthouse |
| 6.3 | Production env vars, domain + DNS, Resend domain verification (SPF/DKIM), live Stripe keys + live webhook |
| 6.4 | Live low-value purchase → verify → refund → verify |
| 6.5 | Go-live (all of §19 ticked) |

- **Learn:** DNS, email deliverability, production vs preview configuration, monitoring.
- **Interview:** *How did you deploy? How do you keep secrets safe? How would you know if payments broke?*

### Phase 7: Post-launch ⬜
Product/stock admin UI first, then the other features deferred in §7.3, prioritised by real business needs.

## 19. Go-live checklist

No launch until all are true:

- [ ] Business registered; Stripe account activated and verified; payout bank account confirmed
- [ ] Tax configuration decided with accountant and set in Stripe
- [ ] Shipping rates, carrier and delivery estimates final and shown on site + Checkout
- [ ] All policies (returns/damage, shipping, privacy, terms) approved by the client
- [ ] Anti-tarnish and product claims reviewed for accuracy
- [ ] Real photos and specs for every listed product; stock counts verified
- [ ] Full test-mode payment checklist passed on the preview deployment
- [ ] Live webhook endpoint configured and receiving events
- [ ] Live low-value purchase → PAID, emails received, stock decremented → refunded → REFUNDED
- [ ] Business email + Resend domain verified (SPF/DKIM); emails not landing in spam
- [ ] Database restore window enabled; backup taken
- [ ] Mobile + accessibility checks passed
- [ ] Client knows how to fulfil an order and where to see new orders
- **Fallback if Stripe/registration is not ready:** launch catalogue-only with checkout disabled by a config flag; enable payments the day verification completes.

## 20. Risks & technical challenges

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Business registration / Stripe verification delayed | Medium | Can't take payments at launch | Client creates Stripe account now (test mode); checkout-disabled fallback |
| Developer time (exams) | High | Scope slips | Admin may follow launch; strict MVP; no new features before launch |
| Photos/data late | Medium | No launch | Real photos already supplied; launch with fewer products if needed |
| Webhook bugs → paid orders not recorded | Low | High | Idempotent design, integration tests, Stripe failed-webhook alerts, Stripe dashboard as backup record |
| Oversell of last unit | Low | Low | Accepted + flagged; reorder or refund |
| Wrong production data via scripts | Medium | Medium | Zod validation, `--prod` flag + confirmation, Git history, PITR |
| Misleading product claims | Medium | Legal/trust | Structured specs, reviewed wording, no invented claims |
| Disputes/chargebacks | Low | Fees + loss | Clear policy, terms checkbox, tracked shipping, unboxing evidence |
| Holiday shipping cut-offs | High | Customer complaints | Show delivery estimates and a holiday cut-off notice |
| Next.js caching surprises | Medium | Stale prices/stock shown | Stock/price always re-checked at checkout; explicit revalidation |
| Client home address exposure | Medium | Privacy | Ask advisor about required business address; consider PO box |
| `npm audit`: 3 high (ReDoS in `effect`, pulled in only by the Prisma **CLI** dev tool) | Low | None at runtime: not in the deployed app | Re-check on each Prisma upgrade; never "fix" by downgrading to Prisma 6 |

## 21. Learning objectives (developer)

By launch, be able to explain and modify without help:
1. Next.js App Router rendering model (Server/Client Components, Server Actions, Route Handlers, caching).
2. Relational schema design: products/variants, orders/order items, snapshots, constraints.
3. Prisma migrations and transactions.
4. Full Stripe Checkout + webhook lifecycle, signature verification, idempotency.
5. Concurrency: race conditions and atomic conditional updates.
6. Authentication vs authorisation; OAuth sign-in; protecting server actions.
7. Secure configuration: env vars, secrets per environment, `.gitignore`.
8. Deployment: Vercel, preview vs production, DNS, email authentication records.
9. Git workflow: branches, commits, PRs, remotes.
10. Testing payment systems.

## 22. Interview preparation

Maintained in **`docs/interview-notes.md`** (created in Phase 2), updated after each major feature with: the concept, how Merseya implements it, the trade-offs, and likely interview questions with model answers. Core topics:
- Monolith (Next.js full-stack) vs separate frontend/backend
- SQL vs NoSQL for commerce data
- Payment flow, webhooks, idempotency, why redirects aren't proof of payment
- Inventory consistency and race conditions
- Guest checkout design and adding accounts later
- Admin security and defence in depth
- Server-side rendering, caching, and SEO
- Money handling (integer cents, tax-exclusive pricing, snapshots)
- Deployment, environments and secrets
- Trade-offs: why no admin product UI, no stock reservation, no carrier API (and when you'd add them)

## 23. Open questions & pending decisions

| # | Item | Owner | Needed before |
|---|---|---|---|
| P1 | GST/HST registration & tax configuration (Stripe Tax on/off) | Client + accountant | Phase 6 |
| P2 | Shipping carrier/service, flat rate(s), free-shipping threshold, delivery estimates, holiday cut-off | Client | Phase 4 (provisional), Phase 6 (final) |
| P3 | Anti-tarnish wording + supplier coating details | Client + supplier | Task 3.3 (provisional), Phase 6 (final) |
| P4 | Final policy texts (returns/damage, shipping, privacy, terms), claim window (48 vs 72 h) | Client (+ advisor) | Task 3.5 (draft), Phase 6 (final) |
| P5 | Business address shown on site / return address (PO box?) | Client (+ advisor) | Phase 6 (and Stripe activation) |
| P6 | Business email provider (Google Workspace / Zoho) + addresses (orders@, hello@) | Client | Phase 6 |
| P7 | Domain `merseya.ca` purchase (in business/client name) | Client | Phase 6 |
| P8 | Stripe account: create in test mode → activate after registration | Client | Phase 4 (test), Phase 6 (live) |
| P9 | Vercel account (business-owned) | Developer | Task 2.6 |
| P10 | ~~Logo files~~ ✅ Received (transparent PNGs, final) | — | — |
| P11 | Google account(s) allowed into admin | Client | Phase 5 |
| P12 | Product data + photos: sample products ✅ ready; full catalogue (~20 products, ring sizes per ring) | Client + developer | Task 2.5 (samples), Phase 6 (full) |
| P13 | Announcement bar text, social links, About-us story text | Client | Task 3.5 (draft), Phase 6 (final) |
| P14 | ~~Confirm tech choices~~ ✅ Confirmed | — | — |
| P15 | Vercel Pro billing (~US$20/month) approved by the client | Client | Task 2.6 (start Pro trial), Phase 6 (paid) |
| P17 | ✅ **Decided:** Vercel Production uses the Neon `production` branch (tables migrated, catalogue empty until launch). Migrations reach production by a **manual release step**: the developer runs `npm run db:deploy` with `.env.prod` before merging any PR that changes the schema | — | Task 3.0b |
| P16 | Optional extra logo files: wordmark-only lockup ("Merseya / JEWELLERY" without monogram, plum + blush, transparent) for a compact header | Client/designer | Phase 3 |

## 24. Development workflow

- **Git is operated manually by the developer.** Claude Code inspects Git state read-only and hands off exact commands; see `CLAUDE.md` for the full rule.
- Feature branches (`feature/…`, `fix/…`, `docs/…`, `chore/…`) → push → Pull Request → review Vercel preview → developer merges into `main`.
- `main` stays deployable at all times; Vercel deploys `main` to production.
- Conventional Commit messages; small, coherent commits, pushed frequently.
- Defaults: npm, Node 24 LTS, Neon `dev` branch for local development.
