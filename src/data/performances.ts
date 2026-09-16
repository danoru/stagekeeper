import type { PerformanceType, Prisma } from "@prisma/client";

import prisma from "./db";

export const PERFORMANCE_LIST = [
  {
    musical: "Joseph and the Amazing Technicolor Dreamcoat",
    startTime: new Date("2019-09-14"),
    endTime: new Date("2019-09-14"),
    theatre: "Playhouse Merced",
  },
  {
    musical: "Heathers",
    startTime: new Date("2019-11-23"),
    endTime: new Date("2019-11-23"),
    theatre: "OB Playhouse",
  },
  {
    musical: "Frozen",
    startTime: new Date("2020-01-16"),
    endTime: new Date("2020-01-16"),
    theatre: "Pantages Theatre",
  },
  {
    musical: "The Rocky Horror Show",
    startTime: new Date("2020-01-19"),
    endTime: new Date("2020-01-19"),
    theatre: "OB Playhouse",
  },
  {
    musical: "Fun Home",
    startTime: new Date("2020-01-19"),
    endTime: new Date("2020-01-19"),
    theatre: "Patio Playhouse",
  },
  {
    musical: "Kinky Boots",
    startTime: new Date("2020-02-28"),
    endTime: new Date("2020-02-28"),
    theatre: "Cerritos Center for the Performing Arts",
  },
  {
    musical: "Once on this Island",
    startTime: new Date("2021-07-03"),
    endTime: new Date("2021-07-03"),
    theatre: "Moonlight Amphitheatre",
  },
  {
    musical: "Spamalot",
    startTime: new Date("2021-12-04"),
    endTime: new Date("2021-12-04"),
    theatre: "OB Playhouse",
  },
  {
    musical: "A Little Night Music",
    startTime: new Date("2022-03-12"),
    endTime: new Date("2022-03-12"),
    theatre: "Greenway Court Theatre",
  },
  {
    musical: "Annie",
    startTime: new Date("2022-12-09"),
    endTime: new Date("2022-12-09"),
    theatre: "Dolby Theatre",
  },
  {
    musical: "Assassins",
    startTime: new Date("2022-02-27"),
    endTime: new Date("2022-02-27"),
    theatre: "East West Players",
  },
  {
    musical: "Drag the Musical",
    startTime: new Date("2022-10-07"),
    endTime: new Date("2022-10-07"),
    theatre: "The Bourbon Room",
  },
  {
    musical: "Freestyle Love Supreme",
    startTime: new Date("2022-07-20"),
    endTime: new Date("2022-07-20"),
    theatre: "Pasadena Playhouse",
  },
  {
    musical: "Hadestown",
    startTime: new Date("2022-08-14"),
    endTime: new Date("2022-08-14"),
    theatre: "Segerstrom Center for the Arts",
  },
  {
    musical: "In the Heights",
    startTime: new Date("2022-06-17"),
    endTime: new Date("2022-06-17"),
    theatre: "La Mirada Theatre",
  },
  {
    musical: "Moulin Rouge!",
    startTime: new Date("2022-07-31"),
    endTime: new Date("2022-07-31"),
    theatre: "Pantages Theatre",
  },
  {
    musical: "Natasha, Pierre & the Great Comet of 1812",
    startTime: new Date("2022-06-05"),
    endTime: new Date("2022-06-05"),
    theatre: "Capital City Theatre",
  },
  {
    musical: "Once",
    startTime: new Date("2022-04-23"),
    endTime: new Date("2022-04-23"),
    theatre: "California Center for the Arts, Escondido",
  },
  {
    musical: "Rent",
    startTime: new Date("2022-07-16"),
    endTime: new Date("2022-07-16"),
    theatre: "Patio Playhouse",
  },
  {
    musical: "Something Rotten!",
    startTime: new Date("2022-02-12"),
    endTime: new Date("2022-02-12"),
    theatre: "Fred Kavli Theatre",
  },
  {
    musical: "The Book of Mormon",
    startTime: new Date("2022-12-06"),
    endTime: new Date("2022-12-06"),
    theatre: "Pantages Theatre",
  },
  {
    musical: "Wicked",
    startTime: new Date("2022-02-24"),
    endTime: new Date("2022-02-24"),
    theatre: "Segerstrom Center for the Arts",
  },
  {
    musical: "Young Frankenstein",
    startTime: new Date("2022-09-25"),
    endTime: new Date("2022-09-25"),
    theatre: "La Mirada Theatre",
  },
  {
    musical: "Natasha, Pierre & the Great Comet of 1812",
    startTime: new Date("2023-01-13"),
    endTime: new Date("2023-01-13"),
    theatre: "Shotgun Players",
  },
  {
    musical: "Sunday in the Park with George",
    startTime: new Date("2023-02-17"),
    endTime: new Date("2023-02-17"),
    theatre: "Pasadena Playhouse",
  },
  {
    musical: "In the Heights",
    startTime: new Date("2023-03-09"),
    endTime: new Date("2023-03-09"),
    theatre: "Fullerton College Theatre Arts",
  },
  {
    musical: "Hairspray",
    startTime: new Date("2023-04-21"),
    endTime: new Date("2023-04-21"),
    theatre: "Segerstrom Center for the Arts",
  },
  {
    musical: "Chicago",
    startTime: new Date("2023-05-17"),
    endTime: new Date("2023-05-17"),
    theatre: "Segerstrom Center for the Arts",
  },
  {
    musical: "Six",
    startTime: new Date("2023-06-18"),
    endTime: new Date("2023-06-18"),
    theatre: "Segerstrom Center for the Arts",
  },
  {
    musical: "Joseph and the Amazing Technicolor Dreamcoat",
    startTime: new Date("2023-06-24"),
    endTime: new Date("2023-06-24"),
    theatre: "La Mirada Theatre",
  },
  {
    musical: "Into the Woods",
    startTime: new Date("2023-07-29"),
    endTime: new Date("2023-07-29"),
    theatre: "Ahmanson Theatre",
  },
  {
    musical: "Les Misérables",
    startTime: new Date("2023-09-23"),
    endTime: new Date("2023-09-23"),
    theatre: "Segerstrom Center for the Arts",
  },
  {
    musical: "Hadestown",
    startTime: new Date("2023-10-04"),
    endTime: new Date("2023-10-04"),
    theatre: "Ahmanson Theatre",
  },
  {
    musical: "Spring Awakening",
    startTime: new Date("2023-11-17"),
    endTime: new Date("2023-11-17"),
    theatre: "East West Players",
  },
  {
    musical: "Dr. Seuss' How the Grinch Stole Christmas!",
    startTime: new Date("2023-12-10"),
    endTime: new Date("2023-12-10"),
    theatre: "Pantages Theatre",
  },
  {
    musical: "MJ the Musical",
    startTime: new Date("2024-01-11"),
    endTime: new Date("2024-01-11"),
    theatre: "Pantages Theatre",
  },
  {
    musical: "The Lion King",
    startTime: new Date("2024-02-01"),
    endTime: new Date("2024-02-01"),
    theatre: "Segerstrom Center for the Arts",
  },
  {
    musical: "Hedgwig and the Angry Inch",
    startTime: new Date("2024-02-23"),
    endTime: new Date("2024-02-23"),
    theatre: "Chance Theater",
  },
  {
    musical: "9 to 5",
    startTime: new Date("2024-03-23"),
    endTime: new Date("2024-03-23"),
    theatre: "Fullerton College Theatre Arts",
  },
  {
    musical: "Funny Girl",
    startTime: new Date("2024-04-05"),
    endTime: new Date("2024-04-05"),
    theatre: "Ahmanson Theatre",
  },
  {
    musical: "Evil Dead the Musical",
    startTime: new Date("2024-05-10"),
    endTime: new Date("2024-05-10"),
    theatre: "Maverick Theater",
  },
  {
    musical: "The Little Mermaid",
    startTime: new Date("2024-06-20"),
    endTime: new Date("2024-06-20"),
    theatre: "La Mirada Theatre",
  },
  {
    musical: "A Strange Loop",
    startTime: new Date("2024-06-28"),
    endTime: new Date("2024-06-28"),
    theatre: "Ahmanson Theatre",
  },
  {
    musical: "Evita",
    startTime: new Date("2024-06-28"),
    endTime: new Date("2024-06-28"),
    theatre: "Ahmanson Theatre",
  },
];

export async function getPerformances() {
  const performances = await prisma.performances.findMany({
    include: { musicals: true, theatres: true },
    orderBy: {
      startTime: "asc",
    },
  });
  return performances;
}

// Every attendance row is loaded with both the legacy `performances` relation and the
// unified show/theatre/seenDate columns, then normalized so page code can read
// `row.performances.{type,startTime,musicals,plays,theatres}` regardless of which path
// created the row.
// Only what feed cards, the activity list and the review charts actually read.
export const showSummarySelect = {
  id: true,
  title: true,
  playbill: true,
  premiere: true,
  duration: true,
} satisfies Prisma.musicalsSelect & Prisma.playsSelect;

export const theatreSummarySelect = {
  id: true,
  name: true,
  location: true,
} satisfies Prisma.theatresSelect;

export const feedUserSelect = {
  id: true,
  username: true,
  image: true,
} satisfies Prisma.usersSelect;

export const attendanceInclude = {
  performances: {
    select: {
      id: true,
      type: true,
      startTime: true,
      endTime: true,
      musical: true,
      play: true,
      theatre: true,
      musicals: { select: showSummarySelect },
      plays: { select: showSummarySelect },
      theatres: { select: theatreSummarySelect },
    },
  },
  musicals: { select: showSummarySelect },
  plays: { select: showSummarySelect },
  theatres: { select: theatreSummarySelect },
  users: { select: feedUserSelect },
} satisfies Prisma.attendanceInclude;

type RawAttendance = Prisma.attendanceGetPayload<{ include: typeof attendanceInclude }>;
export type ShowSummary = Prisma.musicalsGetPayload<{ select: typeof showSummarySelect }>;
export type TheatreSummary = Prisma.theatresGetPayload<{ select: typeof theatreSummarySelect }>;
export type FeedUser = Prisma.usersGetPayload<{ select: typeof feedUserSelect }>;

export type NormalizedPerformance = {
  id: number | null;
  type: PerformanceType;
  startTime: Date;
  endTime: Date;
  musical: number | null;
  play: number | null;
  theatre: number | null;
  musicals: ShowSummary | null;
  plays: ShowSummary | null;
  theatres: TheatreSummary;
};

export type NormalizedAttendance = Omit<RawAttendance, "performances"> & {
  performances: NormalizedPerformance;
  isUpcoming: boolean;
};

const UNKNOWN_THEATRE: TheatreSummary = { id: 0, name: "Unknown theatre", location: "" };

function startOfToday() {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

export function normalizeAttendance(row: RawAttendance): NormalizedAttendance | null {
  const today = startOfToday();
  if (row.performances) {
    const perf = row.performances;
    const startTime = row.seenDate ?? perf.startTime;
    return {
      ...row,
      performances: { ...perf, startTime },
      isUpcoming: row.going && startTime >= today,
    };
  }

  const type: PerformanceType | null = row.musical ? "MUSICAL" : row.play ? "PLAY" : null;
  const show = type === "MUSICAL" ? row.musicals : row.plays;
  if (!type || !show) return null;

  // Rows without a date sort to the beginning of time so they never masquerade as recent.
  const startTime = row.seenDate ?? new Date(0);
  return {
    ...row,
    performances: {
      id: null,
      type,
      startTime,
      endTime: startTime,
      musical: row.musical,
      play: row.play,
      theatre: row.theatre,
      musicals: type === "MUSICAL" ? row.musicals : null,
      plays: type === "PLAY" ? row.plays : null,
      theatres: row.theatres ?? UNKNOWN_THEATRE,
    },
    isUpcoming: row.going && startTime >= today,
  };
}

export function normalizeAttendanceRows(rows: RawAttendance[]) {
  return rows.map(normalizeAttendance).filter((r): r is NormalizedAttendance => r !== null);
}

function byStartTimeDesc(a: NormalizedAttendance, b: NormalizedAttendance) {
  return b.performances.startTime.getTime() - a.performances.startTime.getTime();
}

function byStartTimeAsc(a: NormalizedAttendance, b: NormalizedAttendance) {
  return a.performances.startTime.getTime() - b.performances.startTime.getTime();
}

// Shows the given users have marked "going" with a date today or later.
export async function getFriendsUpcomingPerformances(usernames: string[], take = 20) {
  if (usernames.length === 0) return [];
  const rows = await prisma.attendance.findMany({
    where: {
      users: { username: { in: usernames } },
      going: true,
      seenDate: { gte: startOfToday() },
    },
    include: attendanceInclude,
    orderBy: { seenDate: "asc" },
    take,
  });
  return normalizeAttendanceRows(rows).sort(byStartTimeAsc);
}

// Past attendance (not future "going" rows), newest first.
export async function getRecentPerformances(usernames: string[], take = 20) {
  if (usernames.length === 0) return [];
  const rows = await prisma.attendance.findMany({
    where: {
      users: { username: { in: usernames } },
      OR: [{ going: false }, { seenDate: { lt: startOfToday() } }],
    },
    include: attendanceInclude,
    orderBy: { createdAt: "desc" },
    take: take * 3,
  });
  return normalizeAttendanceRows(rows).sort(byStartTimeDesc).slice(0, take);
}

export async function getUserAttendance(id: number) {
  const rows = await prisma.attendance.findMany({
    where: { user: id },
    include: attendanceInclude,
  });
  return normalizeAttendanceRows(rows).sort((a, b) =>
    (a.performances.musicals?.title ?? a.performances.plays?.title ?? "").localeCompare(
      b.performances.musicals?.title ?? b.performances.plays?.title ?? ""
    )
  );
}

export async function getUserAttendanceHistory(id: number) {
  const rows = await prisma.attendance.findMany({
    where: { user: id },
    include: attendanceInclude,
  });
  return normalizeAttendanceRows(rows).sort(byStartTimeDesc);
}

export async function getUserUpcoming(id: number) {
  const rows = await prisma.attendance.findMany({
    where: { user: id, going: true, seenDate: { gte: startOfToday() } },
    include: attendanceInclude,
    orderBy: { seenDate: "asc" },
  });
  return normalizeAttendanceRows(rows);
}

export async function getUserAttendanceByYear(year: number | null, id: number) {
  const today = startOfToday();
  // Stats need a date, so undated manual logs are excluded at the DB rather than after load.
  const dated: Prisma.attendanceWhereInput = year
    ? {
        OR: [
          {
            seenDate: {
              gte: new Date(Date.UTC(year, 0, 1)),
              lt: new Date(Date.UTC(year + 1, 0, 1)),
            },
          },
          {
            seenDate: null,
            performances: {
              startTime: {
                gte: new Date(Date.UTC(year, 0, 1)),
                lt: new Date(Date.UTC(year + 1, 0, 1)),
              },
            },
          },
        ],
      }
    : { OR: [{ seenDate: { not: null } }, { performance: { not: null } }] };

  const rows = await prisma.attendance.findMany({
    where: {
      user: id,
      AND: [dated, { OR: [{ going: false }, { seenDate: { lt: today } }] }],
    },
    include: attendanceInclude,
  });
  return normalizeAttendanceRows(rows).sort(byStartTimeAsc);
}
