// Shared start-up for developer scripts: picks the target database and,
// for production, demands an explicit typed confirmation.
//
// - Default:      loads `.env`      → the Neon `dev` branch.
// - With --prod:  loads `.env.prod` → the Neon `production` branch.
//   (Not `.env.production`: Next.js loads that file automatically during
//   `next build`, and a local build must never touch the live database.)

import { existsSync } from "node:fs";
import { createInterface } from "node:readline/promises";

export const isProd = process.argv.includes("--prod");

export async function loadScriptEnv(action: string): Promise<void> {
  const file = isProd ? ".env.prod" : ".env";
  if (!existsSync(file)) {
    throw new Error(`${file} not found. Copy .env.example to ${file} and fill it in.`);
  }
  process.loadEnvFile(file);

  if (isProd) {
    const rl = createInterface({ input: process.stdin, output: process.stdout });
    const answer = await rl.question(
      `\n⚠  You are about to ${action} on the PRODUCTION database.\n` +
        `   Type PRODUCTION to continue: `,
    );
    rl.close();
    if (answer.trim() !== "PRODUCTION") {
      console.log("Cancelled. Nothing was changed.");
      process.exit(1);
    }
  }
  console.log(`Target: ${isProd ? "PRODUCTION (.env.prod)" : "development (.env)"}\n`);
}

export function requireVar(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing ${name} in your env file.`);
  return value;
}
