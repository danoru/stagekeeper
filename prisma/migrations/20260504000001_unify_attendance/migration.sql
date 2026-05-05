-- Unify attendance: one table handles both "specific performance" and "vague/multi" logs.
-- All steps are wrapped in a transaction; partial failure rolls back.
BEGIN;

-- 1. Add nullable columns for the vague case (when no performance row exists).
ALTER TABLE "attendance" ADD COLUMN IF NOT EXISTS "musical" INTEGER;
ALTER TABLE "attendance" ADD COLUMN IF NOT EXISTS "play" INTEGER;
ALTER TABLE "attendance" ADD COLUMN IF NOT EXISTS "theatre" INTEGER;
ALTER TABLE "attendance" ADD COLUMN IF NOT EXISTS "seenDate" DATE;

-- 2. Allow NULL on performance (was NOT NULL). Existing rows keep their values.
ALTER TABLE "attendance" ALTER COLUMN "performance" DROP NOT NULL;

-- 3. Foreign keys for the new optional columns. NoAction matches existing convention.
ALTER TABLE "attendance"
  ADD CONSTRAINT "attendance_musical_fkey"
  FOREIGN KEY ("musical") REFERENCES "musicals"("id")
  ON DELETE NO ACTION ON UPDATE NO ACTION;

ALTER TABLE "attendance"
  ADD CONSTRAINT "attendance_play_fkey"
  FOREIGN KEY ("play") REFERENCES "plays"("id")
  ON DELETE NO ACTION ON UPDATE NO ACTION;

ALTER TABLE "attendance"
  ADD CONSTRAINT "attendance_theatre_fkey"
  FOREIGN KEY ("theatre") REFERENCES "theatres"("id")
  ON DELETE NO ACTION ON UPDATE NO ACTION;

-- 4. Indexes for the new FK / sort columns.
CREATE INDEX IF NOT EXISTS "attendance_musical_idx" ON "attendance"("musical");
CREATE INDEX IF NOT EXISTS "attendance_play_idx" ON "attendance"("play");
CREATE INDEX IF NOT EXISTS "attendance_theatre_idx" ON "attendance"("theatre");
CREATE INDEX IF NOT EXISTS "attendance_seenDate_idx" ON "attendance"("seenDate");

-- 5. Invariant: every row must identify the show somehow.
ALTER TABLE "attendance"
  ADD CONSTRAINT "attendance_show_identified_chk"
  CHECK (
    "performance" IS NOT NULL
    OR "musical" IS NOT NULL
    OR "play" IS NOT NULL
  );

-- 6. Drop the unused logs table + its enum.
DROP TABLE IF EXISTS "logs";
DROP TYPE IF EXISTS "LogStatus";

COMMIT;
