-- Launch safety: rate limits shared across instances, session revocation on password change,
-- email verification and member reports. Generated with `prisma migrate diff`, plus the
-- backfill that treats everyone who already has an account as verified.
BEGIN;

CREATE TYPE "ReportTarget" AS ENUM ('MUSICAL', 'PLAY', 'THEATRE', 'PERSON', 'USER');

ALTER TABLE "users" ADD COLUMN "emailVerifiedAt" TIMESTAMPTZ(6),
ADD COLUMN "emailVerifyExpires" TIMESTAMPTZ(6),
ADD COLUMN "emailVerifyToken" TEXT,
ADD COLUMN "passwordChangedAt" TIMESTAMPTZ(6);

UPDATE "users" SET "emailVerifiedAt" = CURRENT_TIMESTAMP;

CREATE TABLE "rateLimits" (
    "key" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,
    "resetAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "rateLimits_pkey" PRIMARY KEY ("key")
);

CREATE TABLE "reports" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reporter" INTEGER,
    "targetType" "ReportTarget" NOT NULL,
    "targetId" INTEGER NOT NULL,
    "label" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "details" TEXT,
    "resolvedAt" TIMESTAMPTZ(6),

    CONSTRAINT "reports_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "rateLimits_resetAt_idx" ON "rateLimits"("resetAt");
CREATE INDEX "reports_resolvedAt_idx" ON "reports"("resolvedAt");
CREATE INDEX "reports_reporter_idx" ON "reports"("reporter");
CREATE UNIQUE INDEX "users_emailVerifyToken_key" ON "users"("emailVerifyToken");

ALTER TABLE "reports" ADD CONSTRAINT "reports_reporter_fkey" FOREIGN KEY ("reporter") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

COMMIT;
