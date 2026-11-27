// Validated server-side environment variables.
//
// WHY: process.env values are untyped strings that may be missing or wrong.
// Validating them ONCE, at startup, turns "mysterious crash deep inside a
// payment" into a clear error like "DATABASE_URL: Invalid URL" before
// anything runs. The rest of the app imports `env`, never `process.env`.
//
// RULES
// - Server-only values. Never import this file into a "use client" component.
//   Next.js only sends variables prefixed NEXT_PUBLIC_ to the browser; we
//   have none yet.
// - A variable is added to the schema in the task that first needs it
//   (plan.md §18), so the app never demands keys for services we aren't using yet.
// - Error messages list variable NAMES only, never their values (secrets).

import { z } from "zod";

const postgresUrl = z.url({
  protocol: /^postgres(ql)?$/,
  error: "must be a postgresql:// connection string",
});

const serverEnvSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),

  // Task 2.4: Neon PostgreSQL
  // Pooled connection (host contains "-pooler"): used by the app at runtime.
  DATABASE_URL: postgresUrl,
  // Direct connection (no "-pooler"): used by Prisma for migrations.
  DATABASE_URL_UNPOOLED: postgresUrl,

  // Task 2.5: Cloudinary. The app only needs the (public) cloud name to build
  // image URLs. The API key and secret are used by `catalog:sync` only.
  CLOUDINARY_CLOUD_NAME: z.string().min(1),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

export function parseServerEnv(
  source: Record<string, string | undefined>,
): ServerEnv {
  const result = serverEnvSchema.safeParse(source);
  if (!result.success) {
    const problems = result.error.issues
      .map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`)
      .join("\n");
    throw new Error(
      `Invalid or missing environment variables:\n${problems}\n` +
        `Copy .env.example to .env and fill in the values.`,
    );
  }
  return result.data;
}

export const env = parseServerEnv(process.env);
