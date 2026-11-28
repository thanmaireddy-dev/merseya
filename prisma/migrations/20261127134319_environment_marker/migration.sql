-- CreateTable
CREATE TABLE "EnvironmentMarker" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "name" TEXT NOT NULL,
    "markedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EnvironmentMarker_pkey" PRIMARY KEY ("id")
);

-- Hand-written: Prisma cannot express CHECK constraints in schema.prisma.
-- Only ONE row may exist, and it can only say "dev" or "production".
ALTER TABLE "EnvironmentMarker" ADD CONSTRAINT "EnvironmentMarker_single_row" CHECK ("id" = 1);
ALTER TABLE "EnvironmentMarker" ADD CONSTRAINT "EnvironmentMarker_name_valid" CHECK ("name" IN ('dev', 'production'));
