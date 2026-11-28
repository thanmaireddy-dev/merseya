// Records which environment a database is. Run ONCE per Neon branch:
//
//   npm run db:mark -- dev                     (uses .env)
//   npm run db:mark -- production --prod       (uses .env.prod, typed confirmation)
//
// The name must match the env file: "dev" without --prod, "production" with it.
// Changing an existing marker (e.g. after a dev branch was reset from
// production) needs --force AND typing the database's endpoint id, so you have
// to look at which database you are about to re-label.

import { createInterface } from "node:readline/promises";
import { endpointId, expectedEnvironment } from "./lib/db-target";
import { isProd, loadScriptEnv } from "./lib/script-env";

const args = process.argv.slice(2);
const name = args.find((a) => !a.startsWith("--"));
const force = args.includes("--force");
const expected = expectedEnvironment(isProd);

if (name !== expected) {
  console.error(
    `✖ "${name ?? "(missing)"}" doesn't match the env file in use.\n` +
      `  Use: npm run db:mark -- dev   or   npm run db:mark -- production --prod`,
  );
  process.exit(1);
}

async function main() {
  await loadScriptEnv(`mark this database as "${expected}"`);
  const { db } = await import("../src/lib/db");
  const endpoint = endpointId(process.env.DATABASE_URL);

  const current = await db.environmentMarker.findUnique({ where: { id: 1 } });
  if (current?.name === expected) {
    console.log(`✔ ${endpoint} is already marked "${expected}". Nothing to do.`);
  } else if (current && !force) {
    console.error(
      `✖ ${endpoint} is marked "${current.name}". Refusing to change it to "${expected}".\n` +
        `  If you are SURE this is the ${expected} database (e.g. a dev branch reset from production),\n` +
        `  re-run with --force.`,
    );
    process.exitCode = 1;
  } else {
    if (current) {
      const rl = createInterface({ input: process.stdin, output: process.stdout });
      const typed = await rl.question(
        `⚠  Re-labelling ${endpoint} from "${current.name}" to "${expected}".\n` +
          `   Type the endpoint id (${endpoint}) to confirm: `,
      );
      rl.close();
      if (typed.trim() !== endpoint) {
        console.log("Cancelled. Marker unchanged.");
        process.exitCode = 1;
        await db.$disconnect();
        return;
      }
    }
    await db.environmentMarker.upsert({
      where: { id: 1 },
      create: { id: 1, name: expected },
      update: { name: expected, markedAt: new Date() },
    });
    console.log(`✔ Marked ${endpoint} as "${expected}".`);
  }
  await db.$disconnect();
}

main().catch((err) => {
  console.error("✖ Failed:", err instanceof Error ? err.message : err);
  process.exit(1);
});
