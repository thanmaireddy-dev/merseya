// Prisma CLI configuration (used by `prisma migrate`, `prisma generate`, etc.).
// Since Prisma 7 the CLI no longer reads .env automatically, so we load it
// here with Node's built-in loader. On Vercel there is no .env file:
// the variables come from the project settings instead.
import { existsSync } from "node:fs";
import { defineConfig } from "prisma/config";

if (existsSync(".env")) process.loadEnvFile(".env");

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Migrations use the DIRECT (unpooled) connection: schema changes need a
    // real session, which a connection pooler doesn't provide. The running app
    // uses the pooled DATABASE_URL (see src/lib/db.ts).
    url: process.env.DATABASE_URL_UNPOOLED,
  },
});
