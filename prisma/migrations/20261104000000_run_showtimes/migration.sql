-- Real showtimes: performances can belong to a run (programming) and carry a status and label,
-- and import candidates can hold the showtimes found on a theatre's page. Older performances
-- keep a null programming. Generated with `prisma migrate diff` against the previous schema.
BEGIN;

CREATE TYPE "PerformanceStatus" AS ENUM ('SCHEDULED', 'CANCELED', 'SOLD_OUT');

ALTER TABLE "performances" ADD COLUMN "label" TEXT,
ADD COLUMN "programming" INTEGER,
ADD COLUMN "status" "PerformanceStatus" NOT NULL DEFAULT 'SCHEDULED';

ALTER TABLE "importCandidates" ADD COLUMN "showtimes" JSONB;

CREATE UNIQUE INDEX "performances_programming_startTime_key" ON "performances"("programming", "startTime");

ALTER TABLE "performances" ADD CONSTRAINT "performances_programming_fkey" FOREIGN KEY ("programming") REFERENCES "programming"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

COMMIT;
