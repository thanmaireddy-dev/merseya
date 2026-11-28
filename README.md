# Merseya Jewellery

E-commerce website for **Merseya Jewellery**, an Ontario boutique selling Indian traditional and contemporary imitation and gold-plated jewellery across Canada. Prices are in CAD.

> **Status:** in development. Phase 2 (foundation) is complete; the storefront is next. The roadmap is in [`plan.md`](plan.md) §18. Current catalogue entries are **placeholders** (sample names, prices and photos).

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router, Cache Components), React 19, TypeScript (strict) |
| Styling | Tailwind CSS 4 with brand design tokens; Cormorant Garamond + DM Sans via `next/font` |
| Database | PostgreSQL on Neon, accessed through Prisma 7 (`@prisma/adapter-pg`) |
| Validation | Zod (environment variables, catalogue data, server inputs) |
| Images | Cloudinary |
| Hosting | Vercel |
| Planned | Stripe Checkout + webhooks (payments), Resend (email), Auth.js (orders admin) |

One full-stack Next.js app: pages, server logic and (later) the Stripe webhook in a single deployment. The architecture is in `plan.md` §9.

## Project structure

```
src/app/            routes (App Router); (shop)/ = customer-facing pages
src/components/     UI components
src/lib/            shared server helpers: env.ts (validated env), db.ts (Prisma client), site-config.ts
prisma/             schema.prisma + versioned SQL migrations
catalog/            product catalogue (products.ts) + validation schema; photos/ is git-ignored
scripts/            developer scripts: catalog-sync, stock-adjust
docs/               brand assets, interview notes
```

## Getting started

**Requirements:** Node.js 24, a Neon project (with a `dev` branch) and a Cloudinary account.

1. Install dependencies. This also generates the Prisma client:
   ```bash
   npm install
   ```
2. Copy `.env.example` to `.env` and fill in the values, using the **Neon `dev` branch**. Never commit `.env`.
3. Create the database tables:
   ```bash
   npm run db:migrate
   ```
4. Load the catalogue (categories, products, photos):
   ```bash
   npm run catalog:sync
   ```
5. Start the dev server and open http://localhost:3000:
   ```bash
   npm run dev
   ```

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Development server |
| `npm run build` / `npm start` | Production build / serve it |
| `npm run lint` · `npm run typecheck` | ESLint · route types + TypeScript check |
| `npm run db:migrate` | Create/apply migrations on the dev database |
| `npm run db:deploy` | Apply committed migrations with a marker check; `-- --prod` = the production release step (uses `.env.prod`) |
| `npm run db:studio` | Browse the dev database in Prisma Studio |
| `npm run db:mark -- dev` | Label a database as dev or production, once per Neon branch (`-- production --prod` for production) |
| `npm run catalog:sync` | Validate `catalog/products.ts`, upload new photos, update the dev DB. `-- --check` validates only |
| `npm run stock:adjust -- <SKU> <+n\|-n\|=n>` | Change one variant's stock |

Adding `--prod` to the catalogue and stock scripts targets production: it uses `.env.prod` and asks for typed confirmation. `catalog:sync --prod` refuses to run while any placeholder product remains. Every script also checks the database's **environment marker** and refuses to write if the database isn't the one it expects (`dev` normally, `production` with `--prod`). See [`catalog/README.md`](catalog/README.md).

## Environments

| Environment | Database | Where its variables live |
|---|---|---|
| Local | Neon `dev` branch | `.env` (git-ignored) |
| Vercel Preview | Neon `dev` branch | Vercel → Settings → Environment Variables (Preview) |
| Vercel Production | Neon `production` branch | Vercel → Settings → Environment Variables (Production) |

**Release step for schema changes:** before merging a PR that adds a migration, apply it to production with `npm run db:deploy` (using `.env.prod`).

Cloudinary's API key and secret are only needed by `catalog:sync` on a developer machine. They are **not** configured on Vercel.

## Key rules

- Prices are stored as **integer cents (CAD)**.
- Only a verified Stripe webhook marks an order paid.
- Products are deactivated, never deleted.
- Product information must be real and verifiable. No invented specifications or claims.

Conventions for contributors (and AI assistants) are in [`CLAUDE.md`](CLAUDE.md).
