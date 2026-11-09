import type { PerformanceType } from "@prisma/client";

import { showKey, type ShowListItem } from "../components/shows/ShowList";
import { openRunCutoff, theatreToday } from "../utils/schedule";

import prisma from "./db";
import { visibleAttendance, visibleWatchlist } from "./visibility";

const showCardSelect = { id: true, title: true, playbill: true } as const;

// A user's watchlist as card-ready rows, alphabetical.
export async function getWatchlist(id: number, viewerId: number | null): Promise<ShowListItem[]> {
  const watchlist = await prisma.watchlist.findMany({
    where: { user: id, AND: [visibleWatchlist(viewerId)] },
    select: {
      type: true,
      musicals: { select: showCardSelect },
      plays: { select: showCardSelect },
    },
  });
  return watchlist
    .flatMap((item) => {
      const show = item.type === "MUSICAL" ? item.musicals : item.plays;
      return show ? [{ ...show, type: item.type }] : [];
    })
    .sort((a, b) => a.title.localeCompare(b.title));
}

// Distinct shows of one type a user has seen (future "going" rows excluded), alphabetical.
export async function getUserSeenShows(
  userId: number,
  type: PerformanceType,
  viewerId: number | null
): Promise<ShowListItem[]> {
  const rows = await prisma.attendance.findMany({
    where: {
      user: userId,
      AND: [
        visibleAttendance(viewerId),
        { OR: [{ going: false }, { seenDate: { lt: theatreToday() } }] },
        type === "MUSICAL"
          ? { OR: [{ musical: { not: null } }, { performances: { musical: { not: null } } }] }
          : { OR: [{ play: { not: null } }, { performances: { play: { not: null } } }] },
      ],
    },
    select: {
      musicals: { select: showCardSelect },
      plays: { select: showCardSelect },
      performances: {
        select: {
          musicals: { select: showCardSelect },
          plays: { select: showCardSelect },
        },
      },
    },
  });
  const seen = new Map<number, ShowListItem>();
  for (const row of rows) {
    const show =
      type === "MUSICAL"
        ? (row.musicals ?? row.performances?.musicals)
        : (row.plays ?? row.performances?.plays);
    if (show && !seen.has(show.id)) seen.set(show.id, { ...show, type });
  }
  return Array.from(seen.values()).sort((a, b) => a.title.localeCompare(b.title));
}

export type UpcomingRun = {
  id: number;
  type: PerformanceType;
  startDate: Date;
  endDate: Date;
  musicals: { id: number; title: string; playbill: string } | null;
  plays: { id: number; title: string; playbill: string } | null;
  seasons: { theatres: { name: string } } | null;
};

// Runs on now or opening in the next six months, as the carousel on /musicals and /plays needs.
// End dates are calendar days, so `openRunCutoff` keeps a run listed through its closing night.
export async function getUpcomingRuns(type: PerformanceType): Promise<UpcomingRun[]> {
  const upcomingLimit = new Date();
  upcomingLimit.setMonth(upcomingLimit.getMonth() + 6);
  return prisma.programming.findMany({
    where: { type, startDate: { lte: upcomingLimit }, endDate: { gte: openRunCutoff() } },
    select: {
      id: true,
      type: true,
      startDate: true,
      endDate: true,
      musicals: { select: showCardSelect },
      plays: { select: showCardSelect },
      seasons: { select: { theatres: { select: { name: true } } } },
    },
    orderBy: { startDate: "asc" },
  });
}

// Keys (see `showKey`) of every show with a run on now or opening in the next six months.
export async function getUpcomingShowKeys() {
  const upcomingLimit = new Date();
  upcomingLimit.setMonth(upcomingLimit.getMonth() + 6);
  const rows = await prisma.programming.findMany({
    where: { startDate: { lte: upcomingLimit }, endDate: { gte: openRunCutoff() } },
    select: { type: true, musical: true, play: true },
  });
  return Array.from(
    new Set(
      rows.flatMap((r) => {
        const id = r.type === "MUSICAL" ? r.musical : r.play;
        return id == null ? [] : [showKey(r.type, id)];
      })
    )
  );
}
