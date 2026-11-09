// Pins a visit to a production (one run of a show at one theatre): same show, same theatre,
// dated inside the run or in the week before its stored first day (previews, which season
// pages often leave out). Visits without a theatre or a date can't be pinned. Shared by the
// server (person pages, production stats) and the client (your visits on show pages), and
// mirrored in SQL by `findRunForVisit` in data/productions.ts and the backfill migrations.

/** Visits this many days before a run's stored first day still count as that run. */
export const PREVIEW_DAYS = 7;

const DAY_MS = 86_400_000;

export interface RunRef {
  id: number;
  theatreId: number | null;
  startDate: Date | string;
  endDate: Date | string;
}

export interface VisitRef {
  theatreId: number | null;
  date: Date | string | null;
}

function calendarDay(value: Date | string) {
  const d = new Date(value);
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
}

/**
 * The run a visit belongs to: the pinned `attendance.programming` when the visit has one, else
 * the date match below. The fallback is what lets a dated visit find a run an admin adds later.
 */
export function visitProduction(
  visit: VisitRef & { programming?: number | null },
  runs: RunRef[]
): number | null {
  return visit.programming ?? productionForVisit(visit, runs);
}

/**
 * The id of the run (all of the same show) this visit belongs to, if any: a run that covers the
 * day, else the nearest run opening within `PREVIEW_DAYS` after it.
 */
export function productionForVisit(visit: VisitRef, runs: RunRef[]): number | null {
  if (visit.theatreId == null || !visit.date) return null;
  const day = calendarDay(visit.date);
  const atTheatre = runs.filter((r) => r.theatreId === visit.theatreId);
  const covering = atTheatre.find(
    (r) => day >= calendarDay(r.startDate) && day <= calendarDay(r.endDate)
  );
  if (covering) return covering.id;
  const preview = atTheatre
    .filter((r) => {
      const start = calendarDay(r.startDate);
      return day < start && day >= start - PREVIEW_DAYS * DAY_MS;
    })
    .sort((a, b) => calendarDay(a.startDate) - calendarDay(b.startDate))[0];
  return preview?.id ?? null;
}
