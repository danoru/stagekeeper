import type { PerformanceType } from "@prisma/client";

import { DAY_MS, openRunCutoff } from "../utils/schedule";
import {
  buildStageBoard,
  markWatchlist,
  OPENING_DAYS,
  type BoardRun,
  type StageBoard,
} from "../utils/stageBoard";

import prisma from "./db";

const showSelect = { id: true, title: true, playbill: true } as const;

// The runs are the same for every visitor and the board sits on the home page, so each server
// instance asks the database at most once every five minutes.
const CACHE_MS = 5 * 60_000;
let cached: { at: number; runs: BoardRun[] } | null = null;

async function loadBoardRuns(now: Date): Promise<BoardRun[]> {
  if (cached && now.getTime() - cached.at < CACHE_MS) return cached.runs;

  const rows = await prisma.programming.findMany({
    where: {
      // A day of slack on each side; `buildStageBoard` applies the exact calendar-day rules.
      endDate: { gte: openRunCutoff(now) },
      startDate: { lte: new Date(now.getTime() + (OPENING_DAYS + 1) * DAY_MS) },
      // Shows and theatres a member added stay off public pages until an admin approves them.
      AND: [
        { OR: [{ musical: null }, { musicals: { is: { status: "APPROVED" } } }] },
        { OR: [{ play: null }, { plays: { is: { status: "APPROVED" } } }] },
        { OR: [{ season: null }, { seasons: { is: { theatres: { status: "APPROVED" } } } }] },
      ],
    },
    select: {
      id: true,
      type: true,
      startDate: true,
      endDate: true,
      musicals: { select: showSelect },
      plays: { select: showSelect },
      seasons: { select: { theatres: { select: { name: true } } } },
      // Only real showtimes are rows, so this never counts an estimated schedule.
      _count: {
        select: {
          performances: { where: { startTime: { gte: now }, status: { not: "CANCELED" } } },
        },
      },
    },
  });

  const runs = rows.flatMap((row): BoardRun[] => {
    const show = row.type === "MUSICAL" ? row.musicals : row.plays;
    if (!show) return [];
    return [
      {
        id: row.id,
        type: row.type,
        startDate: row.startDate,
        endDate: row.endDate,
        show,
        theatre: row.seasons?.theatres.name ?? null,
        performancesLeft: row._count.performances,
      },
    ];
  });
  cached = { at: now.getTime(), runs };
  return runs;
}

/**
 * What's opening, closing soon and playing in the next seven days. Pass `type` for the
 * musicals or plays page, and `viewerId` to bring that member's watchlisted shows forward.
 */
export async function getStageBoard(
  opts: { type?: PerformanceType; viewerId?: number | null } = {}
): Promise<StageBoard> {
  const now = new Date();
  const [runs, watchlist] = await Promise.all([
    loadBoardRuns(now),
    opts.viewerId == null
      ? []
      : prisma.watchlist.findMany({
          where: { user: opts.viewerId },
          select: { type: true, musical: true, play: true },
        }),
  ]);

  const board = buildStageBoard(
    opts.type ? runs.filter((run) => run.type === opts.type) : runs,
    now
  );
  const keys = new Set(
    watchlist.flatMap((row) => {
      const id = row.type === "MUSICAL" ? row.musical : row.play;
      return id == null ? [] : [`${row.type}-${id}`];
    })
  );
  return markWatchlist(board, keys);
}
