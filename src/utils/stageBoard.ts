// "This week on local stages": which runs are opening, closing soon or simply playing. Kept free
// of database code so the date rules can be checked on their own; the query is in
// src/data/board.ts.

import type { PerformanceType } from "@prisma/client";

import { calendarDay, DAY_MS, theatreToday } from "./schedule";

/** A run counts as opening when its first day is today or within the six days after. */
export const OPENING_DAYS = 7;
/** A run that's already open is on last call when it closes within this many days. */
export const LAST_CALL_DAYS = 10;
/** "Coming soon" reaches this many months past today. */
export const COMING_SOON_MONTHS = 6;

export interface BoardRun {
  id: number;
  type: PerformanceType;
  startDate: Date | string;
  endDate: Date | string;
  show: { id: number; title: string; playbill: string };
  theatre: string | null;
  /** Real showtimes still to come that aren't canceled. 0 when the run has none on file. */
  performancesLeft: number;
}

export interface BoardItem {
  id: number;
  type: PerformanceType;
  showId: number;
  title: string;
  playbill: string;
  theatre: string | null;
  /** "Opens Fri, Nov 7", "Closes Sun, Nov 9" or "Through Nov 23". */
  dateLabel: string;
  /**
   * Set only on last-call runs that have real showtimes left, so an estimated schedule is
   * never shown as a count.
   */
  performancesLeft: number | null;
  onWatchlist: boolean;
}

export interface StageBoard {
  /** Runs with at least one day in the next seven. */
  productions: number;
  theatres: number;
  opening: BoardItem[];
  lastCall: BoardItem[];
  nowPlaying: BoardItem[];
  /** "Tue, Nov 10 – Mon, Nov 16": the seven days the board covers. */
  weekLabel: string;
  /** Runs opening after this week, by month. Empty unless asked for. */
  comingSoon: ComingSoonMonth[];
}

export interface ComingSoonMonth {
  /** "December", or "January 2028" outside the current year. */
  month: string;
  items: BoardItem[];
}

// Run dates are calendar days stored in UTC, so they're formatted there too. The labels name
// the date rather than saying "tonight", so a cached page is never wrong about the day.
const weekdayFormat = new Intl.DateTimeFormat("en-US", {
  timeZone: "UTC",
  weekday: "short",
  month: "short",
  day: "numeric",
});
const dayFormat = new Intl.DateTimeFormat("en-US", {
  timeZone: "UTC",
  month: "short",
  day: "numeric",
});

const monthFormat = new Intl.DateTimeFormat("en-US", { timeZone: "UTC", month: "long" });
const monthYearFormat = new Intl.DateTimeFormat("en-US", {
  timeZone: "UTC",
  month: "long",
  year: "numeric",
});

export function buildStageBoard(
  runs: BoardRun[],
  now: Date = new Date(),
  opts: { comingSoon?: boolean } = {}
): StageBoard {
  const todayDate = theatreToday(now);
  const today = todayDate.getTime();
  const lastOpeningDay = today + (OPENING_DAYS - 1) * DAY_MS;
  const lastCallDay = today + LAST_CALL_DAYS * DAY_MS;
  const comingSoonLimit = new Date(today);
  comingSoonLimit.setUTCMonth(comingSoonLimit.getUTCMonth() + COMING_SOON_MONTHS);

  const opening: { at: number; item: BoardItem }[] = [];
  const lastCall: { at: number; item: BoardItem }[] = [];
  const nowPlaying: { at: number; item: BoardItem }[] = [];
  const later: { at: number; item: BoardItem }[] = [];
  const theatres = new Set<string>();

  for (const run of runs) {
    const start = calendarDay(run.startDate);
    const end = calendarDay(run.endDate);
    if (end < start || end < today) continue;
    // Each run lands in exactly one place: this week, or coming soon.
    if (start > lastOpeningDay) {
      if (opts.comingSoon && start <= comingSoonLimit.getTime()) {
        later.push({
          at: start,
          item: {
            id: run.id,
            type: run.type,
            showId: run.show.id,
            title: run.show.title,
            playbill: run.show.playbill,
            theatre: run.theatre,
            dateLabel: `Opens ${weekdayFormat.format(start)}`,
            performancesLeft: null,
            onWatchlist: false,
          },
        });
      }
      continue;
    }

    if (run.theatre) theatres.add(run.theatre);
    const item = (dateLabel: string, closing = false): BoardItem => ({
      id: run.id,
      type: run.type,
      showId: run.show.id,
      title: run.show.title,
      playbill: run.show.playbill,
      theatre: run.theatre,
      dateLabel,
      performancesLeft: closing && run.performancesLeft > 0 ? run.performancesLeft : null,
      onWatchlist: false,
    });

    if (start >= today) {
      opening.push({ at: start, item: item(`Opens ${weekdayFormat.format(start)}`) });
    } else if (end <= lastCallDay) {
      lastCall.push({ at: end, item: item(`Closes ${weekdayFormat.format(end)}`, true) });
    } else {
      nowPlaying.push({ at: end, item: item(`Through ${dayFormat.format(end)}`) });
    }
  }

  const inOrder = (rows: { at: number; item: BoardItem }[]) =>
    rows
      .sort((a, b) => a.at - b.at || a.item.title.localeCompare(b.item.title))
      .map((row) => row.item);

  const comingSoon: ComingSoonMonth[] = [];
  later.sort((a, b) => a.at - b.at || a.item.title.localeCompare(b.item.title));
  for (const { at, item } of later) {
    const start = new Date(at);
    const month =
      start.getUTCFullYear() === todayDate.getUTCFullYear()
        ? monthFormat.format(start)
        : monthYearFormat.format(start);
    const last = comingSoon[comingSoon.length - 1];
    if (last?.month === month) last.items.push(item);
    else comingSoon.push({ month, items: [item] });
  }

  return {
    productions: opening.length + lastCall.length + nowPlaying.length,
    theatres: theatres.size,
    opening: inOrder(opening),
    lastCall: inOrder(lastCall),
    nowPlaying: inOrder(nowPlaying),
    weekLabel: `${weekdayFormat.format(today)} – ${weekdayFormat.format(lastOpeningDay)}`,
    comingSoon,
  };
}

/**
 * Marks the viewer's watchlisted shows and moves them to the front of each rail. Keys are
 * `${type}-${showId}`, the same shape as `showKey`.
 */
export function markWatchlist(board: StageBoard, watchlistKeys: Set<string>): StageBoard {
  if (watchlistKeys.size === 0) return board;
  const mark = (items: BoardItem[]) => {
    const marked = items.map((item) => ({
      ...item,
      onWatchlist: watchlistKeys.has(`${item.type}-${item.showId}`),
    }));
    // Array.prototype.sort is stable, so each group keeps its date order.
    return marked.sort((a, b) => Number(b.onWatchlist) - Number(a.onWatchlist));
  };
  return {
    ...board,
    opening: mark(board.opening),
    lastCall: mark(board.lastCall),
    nowPlaying: mark(board.nowPlaying),
  };
}
