-- Season importer: per-theatre scrape settings, staged candidates awaiting
-- admin review, and a log of scrape runs.
BEGIN;

CREATE TYPE "ImportCandidateState" AS ENUM ('NEW', 'DUPLICATE', 'APPROVED', 'SKIPPED');

ALTER TABLE "theatres"
  ADD COLUMN "seasonUrl" TEXT,
  ADD COLUMN "scrapeConfig" JSONB;

CREATE TABLE "importCandidates" (
  "id" SERIAL PRIMARY KEY,
  "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "theatre" INTEGER NOT NULL,
  "sourceUrl" TEXT NOT NULL,
  "rawTitle" TEXT NOT NULL,
  "startDate" TIMESTAMPTZ(6),
  "endDate" TIMESTAMPTZ(6),
  "snippet" TEXT,
  "matchType" "PerformanceType",
  "matchMusical" INTEGER,
  "matchPlay" INTEGER,
  "existingProgramming" INTEGER,
  "state" "ImportCandidateState" NOT NULL DEFAULT 'NEW',
  CONSTRAINT "importCandidates_theatre_fkey" FOREIGN KEY ("theatre") REFERENCES "theatres"("id") ON DELETE CASCADE ON UPDATE NO ACTION,
  CONSTRAINT "importCandidates_matchMusical_fkey" FOREIGN KEY ("matchMusical") REFERENCES "musicals"("id") ON DELETE SET NULL ON UPDATE NO ACTION,
  CONSTRAINT "importCandidates_matchPlay_fkey" FOREIGN KEY ("matchPlay") REFERENCES "plays"("id") ON DELETE SET NULL ON UPDATE NO ACTION
);
CREATE INDEX "importCandidates_theatre_state_idx" ON "importCandidates"("theatre", "state");

CREATE TABLE "importRuns" (
  "id" SERIAL PRIMARY KEY,
  "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "theatre" INTEGER NOT NULL,
  "sourceUrl" TEXT NOT NULL,
  "status" TEXT NOT NULL,
  "itemCount" INTEGER NOT NULL DEFAULT 0,
  "error" TEXT,
  CONSTRAINT "importRuns_theatre_fkey" FOREIGN KEY ("theatre") REFERENCES "theatres"("id") ON DELETE CASCADE ON UPDATE NO ACTION
);
CREATE INDEX "importRuns_theatre_createdAt_idx" ON "importRuns"("theatre", "createdAt");

COMMIT;
