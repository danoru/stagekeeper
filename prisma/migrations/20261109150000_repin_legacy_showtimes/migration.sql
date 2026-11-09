-- Re-pin visits logged against older showtimes (no run of their own). The first backfill read
-- the showtime's UTC date, but those rows hold instants: an 8pm show is stored as 03:00Z the
-- next day, so a visit on a run's closing night missed it. Read the day at the theatre instead.
-- Harmless to run again; it recomputes these rows from scratch (a non-match clears the pin).
UPDATE "attendance" a
SET "programming" = (
  SELECT p."id"
  FROM "programming" p
  JOIN "seasons" s ON s."id" = p."season"
  WHERE s."theatre" = perf."theatre"
    AND ((perf."musical" IS NOT NULL AND p."musical" = perf."musical")
      OR (perf."play" IS NOT NULL AND p."play" = perf."play"))
    AND (perf."startTime" AT TIME ZONE 'America/Los_Angeles')::date
        BETWEEN (p."startDate" AT TIME ZONE 'UTC')::date AND (p."endDate" AT TIME ZONE 'UTC')::date
  ORDER BY p."startDate" DESC
  LIMIT 1
)
FROM "performances" perf
WHERE a."performance" = perf."id"
  AND perf."programming" IS NULL;
