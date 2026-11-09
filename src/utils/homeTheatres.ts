// A member's home theatres on the home page: what's on at each, what's next, and this season
// as a row of slots that fill in as they log. Pure, so the season choice and slot states can
// be checked without a database; the queries live in src/data/homeTheatres.ts.

import type { PerformanceType } from "@prisma/client";

import { visitProduction, type VisitRef } from "./productions";
import { calendarDay, theatreToday } from "./schedule";

export interface SeasonRun {
  id: number;
  type: PerformanceType;
  title: string;
  playbill: string;
  startDate: Date | string;
  endDate: Date | string;
}

export interface TheatreSeason {
  id: number;
  name: string;
  startDate: Date | string;
  endDate: Date | string;
  runs: SeasonRun[];
}

export interface HomeTheatreInput {
  id: number;
  name: string;
  location: string;
  image: string;
  seasons: TheatreSeason[];
}

export type SlotState = "seen" | "playing" | "upcoming" | "past";

export interface SeasonSlot {
  id: number;
  type: PerformanceType;
  title: string;
  playbill: string;
  /** "Nov 10 – Dec 6" */
  dateLabel: string;
  state: SlotState;
}

export interface RunLine {
  type: PerformanceType;
  title: string;
  /** "through Nov 22" or "opens Thu, Nov 12" */
  dateLabel: string;
}

export interface HomeTheatreCard {
  id: number;
  name: string;
  location: string;
  image: string;
  nowPlaying: RunLine[];
  next: RunLine | null;
  season: { id: number; name: string; seen: number; total: number; slots: SeasonSlot[] } | null;
}

// Season and run dates are calendar days stored in UTC, so they're formatted there.
const dayFormat = new Intl.DateTimeFormat("en-US", {
  timeZone: "UTC",
  month: "short",
  day: "numeric",
});
const weekdayFormat = new Intl.DateTimeFormat("en-US", {
  timeZone: "UTC",
  weekday: "short",
  month: "short",
  day: "numeric",
});

/**
 * The season to show: the one running today; otherwise the next to start; otherwise the most
 * recent one. The newest season by start date is wrong as soon as next year's is announced.
 */
export function pickSeason(seasons: TheatreSeason[], today: number): TheatreSeason | null {
  if (seasons.length === 0) return null;
  const current = seasons.find(
    (s) => calendarDay(s.startDate) <= today && calendarDay(s.endDate) >= today
  );
  if (current) return current;
  const upcoming = seasons
    .filter((s) => calendarDay(s.startDate) > today)
    .sort((a, b) => calendarDay(a.startDate) - calendarDay(b.startDate));
  if (upcoming.length > 0) return upcoming[0];
  return [...seasons].sort((a, b) => calendarDay(b.endDate) - calendarDay(a.endDate))[0];
}

export type HomeVisit = VisitRef & { programming?: number | null };

export function buildHomeTheatreCard(
  theatre: HomeTheatreInput,
  visits: HomeVisit[],
  now: Date = new Date()
): HomeTheatreCard {
  const today = theatreToday(now).getTime();
  const allRuns = theatre.seasons.flatMap((s) => s.runs);
  const runRefs = allRuns.map((r) => ({
    id: r.id,
    theatreId: theatre.id,
    startDate: r.startDate,
    endDate: r.endDate,
  }));
  const seenRuns = new Set<number>();
  for (const visit of visits) {
    const id = visitProduction(visit, runRefs);
    if (id != null) seenRuns.add(id);
  }

  const nowPlaying = allRuns
    .filter((r) => calendarDay(r.startDate) <= today && calendarDay(r.endDate) >= today)
    .sort((a, b) => calendarDay(a.endDate) - calendarDay(b.endDate))
    .map((r) => ({
      type: r.type,
      title: r.title,
      dateLabel: `through ${dayFormat.format(calendarDay(r.endDate))}`,
    }));

  const nextRun = allRuns
    .filter((r) => calendarDay(r.startDate) > today)
    .sort((a, b) => calendarDay(a.startDate) - calendarDay(b.startDate))[0];
  const next = nextRun
    ? {
        type: nextRun.type,
        title: nextRun.title,
        dateLabel: `opens ${weekdayFormat.format(calendarDay(nextRun.startDate))}`,
      }
    : null;

  const season = pickSeason(theatre.seasons, today);
  const slots = season
    ? [...season.runs]
        .sort((a, b) => calendarDay(a.startDate) - calendarDay(b.startDate))
        .map((r): SeasonSlot => {
          const start = calendarDay(r.startDate);
          const end = calendarDay(r.endDate);
          const state: SlotState = seenRuns.has(r.id)
            ? "seen"
            : start <= today && end >= today
              ? "playing"
              : start > today
                ? "upcoming"
                : "past";
          return {
            id: r.id,
            type: r.type,
            title: r.title,
            playbill: r.playbill,
            dateLabel: `${dayFormat.format(start)} – ${dayFormat.format(end)}`,
            state,
          };
        })
    : [];

  return {
    id: theatre.id,
    name: theatre.name,
    location: theatre.location,
    image: theatre.image,
    nowPlaying,
    next,
    season: season
      ? {
          id: season.id,
          name: season.name,
          seen: slots.filter((s) => s.state === "seen").length,
          total: slots.length,
          slots,
        }
      : null,
  };
}
