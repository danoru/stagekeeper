import { DAY_MS } from "../utils/schedule";

import prisma from "./db";

export interface VisitPin {
  musical: number | null;
  play: number | null;
  theatreId: number | null;
  date: Date | null;
}

/**
 * The run a visit belongs to, looked up when the visit is saved: same show, a season at the
 * same theatre, and the visit's calendar day inside the run. The same rule as
 * `productionForVisit` in utils/productions.ts, which readers still use as a fallback. Run
 * dates are stored at UTC midnight or noon, so the day is compared as a half-open range.
 */
export async function findRunForVisit(visit: VisitPin): Promise<number | null> {
  if (visit.theatreId == null || !visit.date) return null;
  const show = visit.musical != null ? { musical: visit.musical } : null;
  const showOrPlay = show ?? (visit.play != null ? { play: visit.play } : null);
  if (!showOrPlay) return null;

  const d = visit.date;
  const day = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
  const run = await prisma.programming.findFirst({
    where: {
      ...showOrPlay,
      seasons: { theatre: visit.theatreId },
      startDate: { lt: new Date(day + DAY_MS) },
      endDate: { gte: new Date(day) },
    },
    select: { id: true },
    orderBy: { startDate: "desc" },
  });
  return run?.id ?? null;
}
