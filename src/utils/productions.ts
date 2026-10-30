// Pins a visit to a production (one run of a show at one theatre): same show, same theatre,
// dated inside the run. Visits without a theatre or a date can't be pinned. Shared by the
// server (person pages, production stats) and the client (your visits on show pages).

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

/** The id of the run (all of the same show) this visit belongs to, if any. */
export function productionForVisit(visit: VisitRef, runs: RunRef[]): number | null {
  if (visit.theatreId == null || !visit.date) return null;
  const day = calendarDay(visit.date);
  const run = runs.find(
    (r) =>
      r.theatreId === visit.theatreId &&
      day >= calendarDay(r.startDate) &&
      day <= calendarDay(r.endDate)
  );
  return run?.id ?? null;
}
