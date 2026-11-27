# Interview notes: Merseya

Concepts behind Merseya's design, written so you can explain them **without notes**. Each entry covers: what it is, how Merseya does it, the trade-off, and likely questions with short answers. Read the answers, then say them in your own words.

---

## Phase 2: Foundation

### 1. Monolith: Next.js full-stack instead of a separate frontend and backend
- **What:** One Next.js app renders the pages *and* runs the server logic: database queries, Server Actions, and later the Stripe webhook.
- **Merseya:** A single repo deployed to Vercel. There's no public REST API, because nothing except our own pages needs our data.
- **Trade-off:** It's simpler to build, deploy and secure, with one codebase and no CORS. In exchange, the backend isn't separately reusable. That would only matter if a mobile app or partners needed our API.
- **Q: Why not React + Express?**
  A: A small single-brand store has one client, the website. A separate API would double the deployments and the configuration and add CORS, for no benefit. If a second client ever appears, we can extract an API then.

### 2. Server Components vs Client Components
- **What:** Server Components render on the server and send HTML; their code never reaches the browser. Client Components (`"use client"`) also run in the browser, so they can use state and handle clicks.
- **Merseya:** Everything is a Server Component by default. The only Client Component so far is `mobile-nav.tsx`, which needs open/closed state.
- **Q: Why does it matter?**
  A: Less JavaScript goes to phones, so pages are faster. Secrets and database access stay on the server automatically.

### 3. Route groups and layouts
- **What:** A folder in brackets, like `(shop)`, groups routes **without changing the URL**. Each folder can have a `layout.tsx` that wraps its pages.
- **Merseya:** `app/layout.tsx` holds what every page needs (fonts, global CSS). `app/(shop)/layout.tsx` adds the header and footer. The future `/admin` will sit outside `(shop)`, so it won't get the shop chrome.

### 4. Cache Components and `"use cache"`
- **What:** In Next.js 16 with Cache Components, data is fetched fresh on every request **unless** you opt in to caching with `"use cache"` plus a `cacheLife` profile.
- **Merseya:** The build *failed* when the footer used `new Date()`. The framework forced an explicit decision about time-dependent output. We cached the copyright year with `cacheLife("days")`.
- **Q: How does caching work in your app?**
  A: Fresh data is the default. We opt in to caching per function, with an explicit lifetime. Product pages will be cached; stock and prices are always re-checked on the server at checkout.

### 5. Design tokens
- **What:** Named variables for colours and fonts, defined in one place.
- **Merseya:** A Tailwind v4 `@theme` block in `globals.css` (`--color-plum` becomes `bg-plum`, `text-plum` and so on). Components never hard-code hex values. Changing the brand balance (more blush) touched 11 lines across 5 files.
- **Bonus:** Measured WCAG contrast ratios decide where each colour may be used. For example, rose is never used for small text (3.0:1).

### 6. Validated environment variables
- **What:** `process.env` holds untyped strings that may be missing.
- **Merseya:** `src/lib/env.ts` validates them once, at startup, with Zod. The app fails fast with a clear message that names the variable but never shows its value.
- **Q: How do you keep secrets safe?**
  A: Secrets live in git-ignored `.env` files locally and in Vercel's encrypted settings in the cloud. They're never in code, logs or chat. Only `NEXT_PUBLIC_` variables reach the browser, and we have none. Each environment gets **only** the secrets it needs: Vercel doesn't even have the Cloudinary API secret.

### 7. Relational schema design
- **Why Postgres over MongoDB:** Orders, order items, products, variants and stock are relational, and they must change *together*. When a payment succeeds, we mark the order paid **and** reduce stock in one transaction. Postgres gives us transactions, foreign keys and constraints that refuse bad data.
- **Money as integer cents:** Floats can't represent 0.1 exactly (`0.1 + 0.2 = 0.30000000000000004`), so $48.00 is stored as `4800`.
- **Every product has at least one variant:** Stock lives on the variant. Earrings have one hidden default variant; rings have one per size. Cart and order code never needs an "is this a ring?" branch.
- **Many-to-many with a join table:** `ProductCategory(productId, categoryId, sortOrder)` with a **composite primary key**, so the database itself prevents adding a product to the same category twice. A bridal set can appear in both Sets and Bridal.
- **Snapshots on order items:** Name, price and SKU are copied at checkout, so a later price change never rewrites past orders.
- **Referential actions:** `onDelete: Restrict` on variants and order items means the database refuses to delete a product that an order references. "Never delete products" is enforced at the lowest level.

### 8. Migrations
- **What:** Version control for the database: ordered SQL files, applied once each. The `_prisma_migrations` table records which have been applied.
- **Merseya:** We generated the SQL with `--create-only`, reviewed it, and added one line so order numbers start at 1001.
- **Story:** When the Neon `dev` branch expired and was deleted, recovering took **two commands**: `prisma migrate dev` to rebuild the tables, then `catalog:sync` to reload the data. The schema and the catalogue live in Git, so the database was never the only copy.

### 9. Connection pooling (serverless + Postgres)
- **What:** Serverless functions start often and each wants its own connection, while Postgres allows a limited number. A pooler (PgBouncer at Neon) shares a few real connections among many clients.
- **Merseya:** The app uses the **pooled** URL. Migrations use the **direct** URL, because schema changes need a stable session. In development, `db.ts` caches the Prisma client on `globalThis`, so hot reloads don't leak connections.

### 10. Idempotent catalogue sync
- **What:** Running an operation twice gives the same result as running it once.
- **Merseya:** `catalog:sync` validates **everything** first, so one bad product stops the run before any write. It uploads photos **outside** database transactions (slow network calls would hold locks), then writes each product in its own transaction. A second run changes nothing. Stock is set only when a variant is first created, so re-syncs never erase sales; we tested this.
- **Q: Why not an admin dashboard?**
  A: One developer manages ~20 products. A validated file under version control gives history, review and rollback for free, and adds no new login surface to secure. The trade-off is that the client depends on the developer for edits, so a product admin is the first post-launch feature.

### 11. Content-addressed (fingerprinted) assets
- **What:** A file's name includes a hash of its contents.
- **Merseya:** Cloudinary IDs look like `halo-earrings/01-543c9d68`. An unchanged photo maps to the same ID and is skipped. A replaced photo gets a new hash, so it's uploaded under a new URL. **No browser or CDN can serve a stale cached image.** Next.js names its JavaScript bundles the same way.

### 12. API key vs API secret (signed requests)
- **Key** = identity: which account this is. **Secret** = proof that you're allowed to use it.
- For uploads, the SDK hashes the request parameters, a timestamp and the secret into a **signature**. It sends the key and the signature, never the secret. Cloudinary recomputes the signature with its own copy of the secret. The timestamp stops old requests being replayed.
- **Same idea in Phase 4:** Stripe signs each webhook with a secret, and we verify it with HMAC.

### 13. Safety rails for production
- `--prod` scripts load a separate `.env.prod` and require typing `PRODUCTION`.
- `catalog:sync --prod` **refuses** to run while any placeholder product exists.
- Why `.env.prod` and not `.env.production`: Next.js auto-loads `.env.production` during `next build`, so a local build could touch the live database.
- **Lesson learned:** a guard is only as good as its assumption. Copying the wrong Neon connection string would have pointed "dev" at production. A check that verifies the target database is planned.
