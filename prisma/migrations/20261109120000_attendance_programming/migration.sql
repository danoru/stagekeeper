-- AlterTable
ALTER TABLE "attendance" ADD COLUMN     "programming" INTEGER;

-- CreateIndex
CREATE INDEX "attendance_programming_idx" ON "attendance"("programming");

-- AddForeignKey
ALTER TABLE "attendance" ADD CONSTRAINT "attendance_programming_fkey" FOREIGN KEY ("programming") REFERENCES "programming"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- Backfill. Same rule as productionForVisit in src/utils/productions.ts: same show, a season at
-- the same theatre, and the visit's UTC calendar day inside the run's UTC calendar days. Every
-- statement only touches rows still unpinned, so running this block again is harmless.

-- 1. Visits logged against a showtime that belongs to a run: the showtime's run.
UPDATE "attendance" a
SET "programming" = perf."programming"
FROM "performances" perf
WHERE a."programming" IS NULL
  AND a."performance" = perf."id"
  AND perf."programming" IS NOT NULL;

-- 2. Visits with a theatre and a date.
UPDATE "attendance" a
SET "programming" = p."id"
FROM "programming" p
JOIN "seasons" s ON s."id" = p."season"
WHERE a."programming" IS NULL
  AND a."seenDate" IS NOT NULL
  AND a."theatre" = s."theatre"
  AND ((a."musical" IS NOT NULL AND p."musical" = a."musical")
    OR (a."play" IS NOT NULL AND p."play" = a."play"))
  AND a."seenDate" >= (p."startDate" AT TIME ZONE 'UTC')::date
  AND a."seenDate" <= (p."endDate" AT TIME ZONE 'UTC')::date;

-- 3. Visits logged against an older showtime with no run: match the showtime's theatre and day.
UPDATE "attendance" a
SET "programming" = p."id"
FROM "performances" perf,
     "programming" p
JOIN "seasons" s ON s."id" = p."season"
WHERE a."programming" IS NULL
  AND a."performance" = perf."id"
  AND perf."theatre" = s."theatre"
  AND ((perf."musical" IS NOT NULL AND p."musical" = perf."musical")
    OR (perf."play" IS NOT NULL AND p."play" = perf."play"))
  AND (perf."startTime" AT TIME ZONE 'UTC')::date >= (p."startDate" AT TIME ZONE 'UTC')::date
  AND (perf."startTime" AT TIME ZONE 'UTC')::date <= (p."endDate" AT TIME ZONE 'UTC')::date;
