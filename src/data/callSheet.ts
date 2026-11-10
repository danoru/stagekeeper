import type { PerformanceType } from "@prisma/client";

import { DAY_MS, theatreToday } from "../utils/schedule";

import prisma from "./db";
import { getGoingVisibleIds } from "./privacy";

// The day-of and day-after home cards: "Tonight" with everything you need to get to the show,
// and the next morning "How was it?". Both are about the viewer's own going dates only.

const DEFAULT_MINUTES = 150;

export interface CallSheet {
  attendanceId: number;
  type: PerformanceType;
  showId: number;
  title: string;
  /** Real curtain time, when the visit was logged against a showtime. */
  curtain: Date | null;
  /** Curtain plus the catalog's running time (or 2½ hours when it has none). */
  outBy: Date | null;
  usedDefaultDuration: boolean;
  theatre: { name: string; address: string | null } | null;
  /** Mutual follows and groupmates going the same night. */
  coming: { username: string; image: string | null }[];
  history: {
    visits: number;
    last: { day: Date; theatre: string | null; rating: number | null } | null;
  };
}

export interface MorningAfter {
  attendanceId: number;
  type: PerformanceType;
  title: string;
  theatre: string | null;
  day: Date;
}

const goingSelect = {
  id: true,
  seenDate: true,
  rating: true,
  comment: true,
  musical: true,
  play: true,
  musicals: { select: { id: true, title: true, duration: true } },
  plays: { select: { id: true, title: true, duration: true } },
  theatres: { select: { name: true, address: true } },
  performances: {
    select: {
      startTime: true,
      musical: true,
      play: true,
      musicals: { select: { id: true, title: true, duration: true } },
      plays: { select: { id: true, title: true, duration: true } },
      theatres: { select: { name: true, address: true } },
    },
  },
} as const;

type GoingRow = Awaited<ReturnType<typeof loadGoingRows>>[number];

function loadGoingRows(userId: number, from: Date, to: Date) {
  return prisma.attendance.findMany({
    where: { user: userId, going: true, seenDate: { gte: from, lte: to } },
    select: goingSelect,
    orderBy: { id: "asc" },
  });
}

function showOf(row: GoingRow) {
  const show =
    row.musicals ?? row.plays ?? row.performances?.musicals ?? row.performances?.plays ?? null;
  const type: PerformanceType =
    row.musical != null || row.performances?.musical != null ? "MUSICAL" : "PLAY";
  return show ? { ...show, type } : null;
}

/** Tonight's card and this morning's, from one query; the "who's coming" lookup only runs on a show day. */
export async function getHomeShowCards(
  userId: number,
  now: Date = new Date()
): Promise<{ tonight: CallSheet | null; morningAfter: MorningAfter | null }> {
  const today = theatreToday(now);
  const yesterday = new Date(today.getTime() - DAY_MS);
  const rows = await loadGoingRows(userId, yesterday, today);

  const yesterdayRow = rows.find(
    (r) => r.seenDate?.getTime() === yesterday.getTime() && r.rating == null && !r.comment
  );
  const yesterdayShow = yesterdayRow ? showOf(yesterdayRow) : null;
  const morningAfter =
    yesterdayRow && yesterdayShow
      ? {
          attendanceId: yesterdayRow.id,
          type: yesterdayShow.type,
          title: yesterdayShow.title,
          theatre: (yesterdayRow.theatres ?? yesterdayRow.performances?.theatres)?.name ?? null,
          day: yesterday,
        }
      : null;

  const todayRow = rows.find((r) => r.seenDate?.getTime() === today.getTime());
  const todayShow = todayRow ? showOf(todayRow) : null;
  if (!todayRow || !todayShow) return { tonight: null, morningAfter };

  const showWhere =
    todayShow.type === "MUSICAL" ? { musical: todayShow.id } : { play: todayShow.id };
  const [visibleIds, past] = await Promise.all([
    getGoingVisibleIds(userId),
    prisma.attendance.findMany({
      where: {
        user: userId,
        OR: [showWhere, { performances: showWhere }],
        AND: [{ OR: [{ going: false }, { seenDate: { lt: today } }] }],
      },
      select: {
        seenDate: true,
        rating: true,
        theatres: { select: { name: true } },
        performances: { select: { startTime: true, theatres: { select: { name: true } } } },
      },
    }),
  ]);
  const friends =
    visibleIds.size === 0
      ? []
      : await prisma.attendance.findMany({
          where: {
            user: { in: [...visibleIds] },
            going: true,
            seenDate: today,
            OR: [showWhere, { performances: showWhere }],
          },
          select: { users: { select: { username: true, image: true } } },
        });

  const curtain = todayRow.performances?.startTime ?? null;
  const minutes = todayShow.duration ?? null;
  const theatre = todayRow.theatres ?? todayRow.performances?.theatres ?? null;
  const pastSorted = past
    .map((p) => ({
      day: p.seenDate ?? (p.performances ? theatreToday(p.performances.startTime) : null),
      theatre: (p.theatres ?? p.performances?.theatres)?.name ?? null,
      rating: p.rating == null ? null : Number(p.rating),
    }))
    .sort((a, b) => (b.day?.getTime() ?? 0) - (a.day?.getTime() ?? 0));
  const lastDated = pastSorted.find((p) => p.day != null);

  const seen = new Set<string>();
  const coming = friends.flatMap((f) => {
    if (!f.users || seen.has(f.users.username)) return [];
    seen.add(f.users.username);
    return [f.users];
  });

  return {
    morningAfter,
    tonight: {
      attendanceId: todayRow.id,
      type: todayShow.type,
      showId: todayShow.id,
      title: todayShow.title,
      curtain,
      outBy: curtain ? new Date(curtain.getTime() + (minutes ?? DEFAULT_MINUTES) * 60_000) : null,
      usedDefaultDuration: minutes == null,
      theatre: theatre ? { name: theatre.name, address: theatre.address ?? null } : null,
      coming,
      history: {
        visits: pastSorted.length,
        last: lastDated
          ? { day: lastDated.day!, theatre: lastDated.theatre, rating: lastDated.rating }
          : null,
      },
    },
  };
}
