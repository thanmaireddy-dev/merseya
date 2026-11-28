// Verifies that scripts are about to write to the database they EXPECT.
//
// The --prod flag decides which env file is loaded, but it can't know whether
// that file actually contains the right connection string. Each Neon branch
// therefore stores its own identity in the EnvironmentMarker table (set once
// with `npm run db:mark`). Without --prod we expect "dev"; with --prod we
// expect "production". Anything else stops the script before it writes.
//
// Fails SAFE: a branch copied or reset from production carries the
// "production" marker, so dev scripts refuse it until it's re-marked.

import type { PrismaClient } from "../../src/generated/prisma/client";

export type EnvironmentName = "dev" | "production";

export function expectedEnvironment(isProd: boolean): EnvironmentName {
  return isProd ? "production" : "dev";
}

/** First label of the database host, e.g. "ep-hidden-dream-bdn0202b". Not secret. */
export function endpointId(connectionString: string | undefined): string {
  if (!connectionString) return "(unknown)";
  return new URL(connectionString).hostname.split(".")[0].replace(/-pooler$/, "");
}

export async function assertDatabaseTarget(
  db: PrismaClient,
  expected: EnvironmentName,
): Promise<void> {
  const endpoint = endpointId(process.env.DATABASE_URL);
  const marker = await db.environmentMarker.findUnique({ where: { id: 1 } });

  if (!marker) {
    throw new Error(
      `This database (${endpoint}) has no environment marker, so I can't tell whether it's dev or production.\n` +
        `  If it really is the ${expected} database, run once:\n` +
        `    npm run db:mark -- ${expected}${expected === "production" ? " --prod" : ""}`,
    );
  }
  if (marker.name !== expected) {
    throw new Error(
      `WRONG DATABASE: expected "${expected}" but ${endpoint} is marked "${marker.name}".\n` +
        `  Nothing was changed. Check the connection strings in ${expected === "production" ? ".env.prod" : ".env"}.`,
    );
  }
  console.log(`✔ Database check: ${endpoint} is marked "${marker.name}".`);
}
