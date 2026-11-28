// Applies committed migrations (`prisma migrate deploy`) to the chosen database.
//
//   npm run db:deploy             dev database (.env)
//   npm run db:deploy -- --prod   PRODUCTION (.env.prod, typed confirmation). The release step.
//
// Why a wrapper instead of calling Prisma directly: prisma.config.ts loads
// `.env`, which is the DEV database. Here we load the right env file FIRST.
// Node's env loader never overrides variables that are already set, so
// Prisma then inherits these values. We also check the environment marker,
// so the release step can't run against the wrong database.

import { spawnSync } from "node:child_process";
import pg from "pg";
import { endpointId, expectedEnvironment } from "./lib/db-target";
import { isProd, loadScriptEnv, requireVar } from "./lib/script-env";

async function main() {
  await loadScriptEnv("apply database migrations");
  const expected = expectedEnvironment(isProd);
  const endpoint = endpointId(requireVar("DATABASE_URL"));

  // Check the marker with a plain query: on a brand-new database the table
  // doesn't exist yet (the first deploy creates it), which Prisma would treat as an error.
  const client = new pg.Client({ connectionString: requireVar("DATABASE_URL_UNPOOLED") });
  await client.connect();
  const table = await client.query(`SELECT to_regclass('"EnvironmentMarker"') AS t`);
  const marker = table.rows[0].t
    ? (await client.query(`SELECT name FROM "EnvironmentMarker" WHERE id = 1`)).rows[0]?.name
    : undefined;
  await client.end();

  if (marker && marker !== expected) {
    throw new Error(`WRONG DATABASE: expected "${expected}" but ${endpoint} is marked "${marker}". Nothing was applied.`);
  }
  console.log(
    marker
      ? `✔ Database check: ${endpoint} is marked "${marker}".`
      : `ℹ ${endpoint} has no marker yet (new database). Mark it after this: npm run db:mark -- ${expected}${isProd ? " --prod" : ""}`,
  );

  const result = spawnSync("npx", ["prisma", "migrate", "deploy"], {
    stdio: "inherit",
    shell: true, // needed on Windows to find npx
    env: process.env, // carries the variables loaded above
  });
  process.exit(result.status ?? 1);
}

main().catch((err) => {
  console.error("✖ Failed:", err instanceof Error ? err.message : err);
  process.exit(1);
});
