import prisma from "./db";
import { publicUserSelect } from "./users";

export type StarterShow = {
  id: number;
  type: "MUSICAL" | "PLAY";
  title: string;
  playbill: string;
  loggedBy: number;
};

// The shows most members have seen — a good first grid for "which of these have you seen?"
export async function getStarterShows(take = 18): Promise<StarterShow[]> {
  const [musicalCounts, playCounts] = await Promise.all([
    prisma.attendance.groupBy({
      by: ["musical"],
      where: { musical: { not: null }, going: false },
      _count: { _all: true },
    }),
    prisma.attendance.groupBy({
      by: ["play"],
      where: { play: { not: null }, going: false },
      _count: { _all: true },
    }),
  ]);
  // Legacy rows reference a performance rather than a show; fold those in too.
  const perfRows = await prisma.attendance.findMany({
    where: { performance: { not: null }, going: false },
    select: { performances: { select: { musical: true, play: true } } },
  });

  const musicalTally = new Map<number, number>();
  const playTally = new Map<number, number>();
  for (const row of musicalCounts) {
    if (row.musical != null) musicalTally.set(row.musical, row._count._all);
  }
  for (const row of playCounts) {
    if (row.play != null) playTally.set(row.play, row._count._all);
  }
  for (const row of perfRows) {
    const m = row.performances?.musical;
    const p = row.performances?.play;
    if (m != null) musicalTally.set(m, (musicalTally.get(m) ?? 0) + 1);
    if (p != null) playTally.set(p, (playTally.get(p) ?? 0) + 1);
  }

  const [musicals, plays] = await Promise.all([
    prisma.musicals.findMany({
      where: { id: { in: Array.from(musicalTally.keys()) }, status: "APPROVED" },
      select: { id: true, title: true, playbill: true },
    }),
    prisma.plays.findMany({
      where: { id: { in: Array.from(playTally.keys()) }, status: "APPROVED" },
      select: { id: true, title: true, playbill: true },
    }),
  ]);

  const combined: StarterShow[] = [
    ...musicals.map((m) => ({
      ...m,
      type: "MUSICAL" as const,
      loggedBy: musicalTally.get(m.id) ?? 0,
    })),
    ...plays.map((p) => ({ ...p, type: "PLAY" as const, loggedBy: playTally.get(p.id) ?? 0 })),
  ];
  return combined
    .sort((a, b) => b.loggedBy - a.loggedBy || a.title.localeCompare(b.title))
    .slice(0, take);
}

export async function getSuggestedPeople(viewerId: number, take = 12) {
  const [people, following] = await Promise.all([
    prisma.users.findMany({
      where: { id: { not: viewerId }, username: { not: "guest" } },
      select: { ...publicUserSelect, _count: { select: { attendance: true } } },
      orderBy: { attendance: { _count: "desc" } },
      take,
    }),
    prisma.following.findMany({ where: { user: viewerId }, select: { followingUsername: true } }),
  ]);
  const followed = new Set(following.map((f) => f.followingUsername.toLowerCase()));
  return people.map((p) => ({ ...p, isFollowing: followed.has(p.username.toLowerCase()) }));
}
