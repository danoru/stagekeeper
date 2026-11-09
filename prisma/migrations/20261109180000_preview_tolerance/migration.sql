-- Preview tolerance (decision 2026-11-09): a visit up to seven days before a run's stored
-- first day belongs to that run, the nearest opening winning. Pins visits the earlier
-- backfills left unpinned; rows already pinned are untouched, so this is harmless to re-run.
-- Run after 20261109150000_repin_legacy_showtimes.

-- 1. Visits with a theatre and a date.
UPDATE "attendance" a
SET "programming" = (
  SELECT p."id"
  FROM "programming" p
  JOIN "seasons" s ON s."id" = p."season"
  WHERE s."theatre" = a."theatre"
    AND ((a."musical" IS NOT NULL AND p."musical" = a."musical")
      OR (a."play" IS NOT NULL AND p."play" = a."play"))
    AND a."seenDate" <  (p."startDate" AT TIME ZONE 'UTC')::date
    AND a."seenDate" >= (p."startDate" AT TIME ZONE 'UTC')::date - 7
  ORDER BY p."startDate" ASC
  LIMIT 1
)
WHERE a."programming" IS NULL
  AND a."performance" IS NULL
  AND a."theatre" IS NOT NULL
  AND a."seenDate" IS NOT NULL;

-- 2. Visits logged against an older showtime with no run of its own (day at the theatre).
UPDATE "attendance" a
SET "programming" = (
  SELECT p."id"
  FROM "programming" p
  JOIN "seasons" s ON s."id" = p."season"
  WHERE s."theatre" = perf."theatre"
    AND ((perf."musical" IS NOT NULL AND p."musical" = perf."musical")
      OR (perf."play" IS NOT NULL AND p."play" = perf."play"))
    AND (perf."startTime" AT TIME ZONE 'America/Los_Angeles')::date <  (p."startDate" AT TIME ZONE 'UTC')::date
    AND (perf."startTime" AT TIME ZONE 'America/Los_Angeles')::date >= (p."startDate" AT TIME ZONE 'UTC')::date - 7
  ORDER BY p."startDate" ASC
  LIMIT 1
)
FROM "performances" perf
WHERE a."performance" = perf."id"
  AND perf."programming" IS NULL
  AND a."programming" IS NULL;
