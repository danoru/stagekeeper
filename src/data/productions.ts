import { PREVIEW_DAYS } from "../utils/productions";
import { DAY_MS } from "../utils/schedule";

import prisma from "./db";

export interface VisitPin {
  musical: number | null;
  play: number | null;
  theatreId: number | null;
  date: Date | null;
}

/** UTC midnight of the calendar day a stored date names. */
function calendarDay(d: Date): number {
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
}

/**
 * The run a visit belongs to, looked up when the visit is saved: same show, a season at the
 * same theatre, and the visit's calendar day inside the run, else the nearest run opening
 * within `PREVIEW_DAYS` after it. The same rule as `productionForVisit` in
 * utils/productions.ts, which readers still use as a fallback. Run dates are stored at UTC
 * midnight or noon, so days are compared as half-open ranges.
 */
export async function findRunForVisit(visit: VisitPin): Promise<number | null> {
  if (visit.theatreId == null || !visit.date) return null;
  const show = visit.musical != null ? { musical: visit.musical } : null;
  const showOrPlay = show ?? (visit.play != null ? { play: visit.play } : null);
  if (!showOrPlay) return null;

  const day = calendarDay(visit.date);
  const atTheatre = { ...showOrPlay, seasons: { theatre: visit.theatreId } };
  const covering = await prisma.programming.findFirst({
    where: {
      ...atTheatre,
      startDate: { lt: new Date(day + DAY_MS) },
      endDate: { gte: new Date(day) },
    },
    select: { id: true },
    orderBy: { startDate: "desc" },
  });
  if (covering) return covering.id;

  const preview = await prisma.programming.findFirst({
    where: {
      ...atTheatre,
      startDate: { gte: new Date(day + DAY_MS), lt: new Date(day + (PREVIEW_DAYS + 1) * DAY_MS) },
    },
    select: { id: true },
    orderBy: { startDate: "asc" },
  });
  return preview?.id ?? null;
}

/**
 * After an admin creates or edits a run: visits pinned to it that no longer fit are unpinned
 * (and re-pinned elsewhere if they fit another run), and unpinned dated visits that now fall
 * inside it are pinned. Visits logged against a showtime keep the showtime's run.
 */
export async function repinRun(programmingId: number): Promise<void> {
  const run = await prisma.programming.findUnique({
    where: { id: programmingId },
    select: {
      id: true,
      musical: true,
      play: true,
      startDate: true,
      endDate: true,
      seasons: { select: { theatre: true } },
    },
  });
  if (!run) return;
  const theatreId = run.seasons?.theatre ?? null;
  const first = calendarDay(run.startDate);
  const last = calendarDay(run.endDate);
  const show = run.musical != null ? { musical: run.musical } : { play: run.play };

  // 1. Visits currently pinned here that were pinned by theatre and date (not by showtime).
  const pinned = await prisma.attendance.findMany({
    where: { programming: run.id, performance: null },
    select: { id: true, musical: true, play: true, theatre: true, seenDate: true },
  });
  for (const v of pinned) {
    const day = v.seenDate ? calendarDay(v.seenDate) : null;
    const stillFits =
      theatreId != null &&
      v.theatre === theatreId &&
      day != null &&
      day >= first - PREVIEW_DAYS * DAY_MS &&
      day <= last &&
      (run.musical != null ? v.musical === run.musical : v.play === run.play);
    if (stillFits) continue;
    const elsewhere = await findRunForVisit({
      musical: v.musical,
      play: v.play,
      theatreId: v.theatre,
      date: v.seenDate,
    });
    await prisma.attendance.update({ where: { id: v.id }, data: { programming: elsewhere } });
  }

  // 2. Unpinned dated visits of this show at this theatre that now fall inside the run or
  //    its preview week.
  if (theatreId == null) return;
  await prisma.attendance.updateMany({
    where: {
      ...show,
      programming: null,
      performance: null,
      theatre: theatreId,
      seenDate: { gte: new Date(first - PREVIEW_DAYS * DAY_MS), lte: new Date(last) },
    },
    data: { programming: run.id },
  });
}
