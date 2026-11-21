// The ONE Prisma client the whole app uses.
//
// - Connects through Prisma's PostgreSQL driver adapter using the POOLED Neon
//   URL. Serverless functions open many short-lived connections, and the
//   pooler shares a small number of real database connections between them.
// - In development, Next.js hot-reloads modules on every save. Without the
//   globalThis cache below, each reload would create a NEW client and its own
//   connections until Neon refuses more ("too many connections").
//
// Server-only: never import this into a "use client" component.

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";
import { env } from "@/lib/env";

function createPrismaClient() {
  const adapter = new PrismaPg({ connectionString: env.DATABASE_URL });
  return new PrismaClient({ adapter });
}

const globalForPrisma = globalThis as unknown as {
  prisma?: ReturnType<typeof createPrismaClient>;
};

export const db = globalForPrisma.prisma ?? createPrismaClient();

if (env.NODE_ENV !== "production") globalForPrisma.prisma = db;
