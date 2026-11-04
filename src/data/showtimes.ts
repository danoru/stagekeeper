import type { PerformanceStatus, Prisma } from "@prisma/client";

import { expandRun, hasDayTimes, parseTime, zonedTime } from "../utils/schedule";

import prisma from "./db";

const DEFAULT_DURATION_MINUTES = 150;

type Tx = Prisma.TransactionClient | typeof prisma;

export const showtimeSelect = {
  id: true,
  startTime: true,
  endTime: true,
  status: true,
  label: true,
} satisfies Prisma.performancesSelect;

const runSelect = {
  id: true,
  type: true,
  musical: true,
  play: true,
  startDate: true,
  endDate: true,
  dayTimes: true,
  musicals: { select: { duration: true } },
  plays: { select: { duration: true } },
  seasons: { select: { theatre: true } },
} satisfies Prisma.programmingSelect;

type RunForShowtimes = Prisma.programmingGetPayload<{ select: typeof runSelect }>;

export class ShowtimeError extends Error {}

/** `performances` needs a theatre, and a run only gets one through its season. */
function requireTheatre(run: RunForShowtimes): number {
  const theatre = run.seasons?.theatre;
  if (theatre == null) throw new ShowtimeError("Put this run in a season before adding showtimes.");
  return theatre;
}

async function loadRun(programmingId: number, tx: Tx = prisma) {
  const run = await tx.programming.findUnique({
    where: { id: programmingId },
    select: runSelect,
  });
  if (!run) throw new ShowtimeError("Run not found.");
  return run;
}

function toRows(run: RunForShowtimes, starts: Date[]): Prisma.performancesCreateManyInput[] {
  const theatre = requireTheatre(run);
  const minutes = run.musicals?.duration ?? run.plays?.duration ?? DEFAULT_DURATION_MINUTES;
  return starts.map((start) => ({
    programming: run.id,
    type: run.type,
    musical: run.musical,
    play: run.play,
    theatre,
    startTime: start,
    endTime: new Date(start.getTime() + minutes * 60_000),
  }));
}

export async function getRunShowtimes(programmingId: number) {
  const [run, showtimes] = await Promise.all([
    loadRun(programmingId),
    prisma.performances.findMany({
      where: { programming: programmingId },
      select: { ...showtimeSelect, _count: { select: { attendance: true } } },
      orderBy: { startTime: "asc" },
    }),
  ]);
  return {
    hasPattern: hasDayTimes(run.dayTimes),
    patternCount: hasDayTimes(run.dayTimes) ? expandRun(run, run.dayTimes).length : 0,
    showtimes,
  };
}

/**
 * Replaces a run's showtimes with its weekly pattern. Rows people have logged stay, since
 * attendance points at them; everything else is rebuilt, so dark dates need marking again.
 */
export async function generateFromPattern(programmingId: number) {
  return prisma.$transaction(async (tx) => {
    const run = await loadRun(programmingId, tx);
    if (!hasDayTimes(run.dayTimes)) {
      throw new ShowtimeError("Set a weekly schedule first; estimates aren't real showtimes.");
    }
    const rows = toRows(run, expandRun(run, run.dayTimes));
    await tx.performances.deleteMany({
      where: { programming: run.id, attendance: { none: {} } },
    });
    const created = await tx.performances.createMany({ data: rows, skipDuplicates: true });
    return created.count;
  });
}

/** `day` is "YYYY-MM-DD"; `time` is anything parseTime reads, as the clock reads at the theatre. */
export async function addShowtime(
  programmingId: number,
  day: string,
  time: string,
  label: string | null
) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(day);
  if (!m) throw new ShowtimeError("Pick a date.");
  const parsed = parseTime(time);
  if (!parsed) throw new ShowtimeError(`Couldn't read "${time}" as a time. Try "8pm".`);
  const [hour, minute] = parsed.split(":").map(Number);
  const start = zonedTime(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])), hour, minute);

  const run = await loadRun(programmingId);
  const [row] = toRows(run, [start]);
  const created = await prisma.performances.createMany({
    data: [{ ...row, label }],
    skipDuplicates: true,
  });
  if (created.count === 0) throw new ShowtimeError("That showtime is already listed.");
}

export async function updateShowtime(
  id: number,
  data: { status?: PerformanceStatus; label?: string | null }
) {
  await prisma.performances.updateMany({
    // Older rows have no run; only showtimes that belong to one are edited here.
    where: { id, programming: { not: null } },
    data,
  });
}

/** Removes a showtime; one people have logged is marked canceled instead so their logs stay. */
export async function removeShowtime(id: number): Promise<"deleted" | "canceled"> {
  const removed = await prisma.performances.deleteMany({
    where: { id, programming: { not: null }, attendance: { none: {} } },
  });
  if (removed.count > 0) return "deleted";
  await prisma.performances.updateMany({
    where: { id, programming: { not: null } },
    data: { status: "CANCELED" },
  });
  return "canceled";
}

/** Adds showtimes found by the season importer, inside the caller's transaction. */
export async function addImportedShowtimes(programmingId: number, starts: Date[], tx: Tx) {
  if (starts.length === 0) return 0;
  const run = await loadRun(programmingId, tx);
  const created = await tx.performances.createMany({
    data: toRows(run, starts),
    skipDuplicates: true,
  });
  return created.count;
}
