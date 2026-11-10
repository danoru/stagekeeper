import { describePart } from "../components/people/creditText";
import { mean } from "../utils/ratings";
import { openRunCutoff, theatreToday } from "../utils/schedule";

import prisma from "./db";

// "Familiar faces": on a show's current and upcoming productions, the company members the
// viewer has seen before in other productions, with when and how they rated it. Lookup only.

export interface FamiliarFace {
  person: { name: string; slug: string };
  partHere: string;
  seen: {
    title: string;
    part: string;
    theatre: string | null;
    year: number;
    rating: number | null;
  };
}

export async function getFamiliarFaces(
  userId: number,
  show: { musical: number } | { play: number }
): Promise<Record<number, FamiliarFace[]>> {
  const upcoming = await prisma.programming.findMany({
    where: { ...show, endDate: { gte: openRunCutoff() } },
    select: {
      id: true,
      credits: {
        where: { status: "APPROVED" },
        select: {
          person: true,
          category: true,
          character: true,
          role: true,
          people: { select: { name: true, slug: true } },
        },
      },
    },
  });
  const personIds = [...new Set(upcoming.flatMap((p) => p.credits.map((c) => c.person)))];
  if (personIds.length === 0) return {};

  // Runs the viewer has been to, pinned on their visits.
  const visits = await prisma.attendance.findMany({
    where: {
      user: userId,
      programming: { not: null },
      OR: [{ going: false }, { seenDate: { lt: theatreToday() } }],
    },
    select: { programming: true, rating: true },
  });
  const ratingsByRun = new Map<number, number[]>();
  for (const v of visits) {
    const list = ratingsByRun.get(v.programming!) ?? [];
    if (v.rating != null) list.push(Number(v.rating));
    ratingsByRun.set(v.programming!, list);
  }
  const upcomingIds = new Set(upcoming.map((p) => p.id));
  const seenRunIds = [...ratingsByRun.keys()].filter((id) => !upcomingIds.has(id));
  if (seenRunIds.length === 0) return {};

  const elsewhere = await prisma.credits.findMany({
    where: { person: { in: personIds }, status: "APPROVED", programming: { in: seenRunIds } },
    select: {
      person: true,
      category: true,
      character: true,
      role: true,
      programmings: {
        select: {
          id: true,
          startDate: true,
          musicals: { select: { title: true } },
          plays: { select: { title: true } },
          seasons: { select: { theatres: { select: { name: true } } } },
        },
      },
    },
    orderBy: { programmings: { startDate: "desc" } },
  });
  // Most recent production seen, per person.
  const latest = new Map<number, (typeof elsewhere)[number]>();
  for (const c of elsewhere) if (!latest.has(c.person)) latest.set(c.person, c);

  const out: Record<number, FamiliarFace[]> = {};
  for (const production of upcoming) {
    const faces: FamiliarFace[] = [];
    const done = new Set<number>();
    for (const credit of production.credits) {
      const seen = latest.get(credit.person);
      if (!seen || done.has(credit.person)) continue;
      done.add(credit.person);
      const run = seen.programmings;
      faces.push({
        person: credit.people,
        partHere: describePart(credit),
        seen: {
          title: run.musicals?.title ?? run.plays?.title ?? "a show",
          part: describePart(seen),
          theatre: run.seasons?.theatres.name ?? null,
          year: run.startDate.getUTCFullYear(),
          rating: mean(ratingsByRun.get(run.id) ?? []),
        },
      });
    }
    if (faces.length > 0) out[production.id] = faces;
  }
  return out;
}
