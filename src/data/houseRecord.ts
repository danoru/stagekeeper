import type { PerformanceType } from "@prisma/client";

import { mean } from "../utils/ratings";
import { openRunCutoff, theatreToday, visitDay } from "../utils/schedule";

import prisma from "./db";

// A theatre's history on its page: every production the site knows of on that stage, how
// members rated each (only above a minimum number of raters), and the people credited there
// most. "Your nights here" is per viewer and comes from a separate call, since the theatre page
// is cached for everyone.

/** Averages are shown only from this many raters, so one person can't define a production. */
export const MIN_RATERS = 5;
const TOP_PEOPLE = 8;

export const NOTE_CATEGORIES = [
  "Parking",
  "Seats",
  "Accessibility",
  "Food and drink",
  "Late seating",
  "Other",
] as const;
export type NoteCategory = (typeof NOTE_CATEGORIES)[number];
export const MAX_NOTE_LENGTH = 280;

export interface HouseProduction {
  id: number;
  type: PerformanceType;
  title: string;
  season: string | null;
  startDate: Date;
  endDate: Date;
  running: boolean;
  seenBy: number;
  /** Null below MIN_RATERS. */
  average: number | null;
}

export interface HouseRecord {
  productions: HouseProduction[];
  bestLoved: HouseProduction | null;
  people: { name: string; slug: string; productions: number }[];
}

export interface HouseNote {
  id: number;
  category: string;
  text: string;
  createdAt: Date;
  helpful: number;
}

export async function getHouseRecord(theatreId: number): Promise<HouseRecord> {
  const runs = await prisma.programming.findMany({
    where: {
      seasons: { theatre: theatreId },
      OR: [
        { musical: null, plays: { status: "APPROVED" } },
        { play: null, musicals: { status: "APPROVED" } },
      ],
    },
    select: {
      id: true,
      type: true,
      startDate: true,
      endDate: true,
      seasons: { select: { name: true } },
      musicals: { select: { title: true } },
      plays: { select: { title: true } },
    },
    orderBy: { startDate: "desc" },
  });
  const runIds = runs.map((r) => r.id);

  const [visits, credits] = await Promise.all([
    runIds.length === 0
      ? []
      : prisma.attendance.findMany({
          where: {
            programming: { in: runIds },
            OR: [{ going: false }, { seenDate: { lt: theatreToday() } }],
          },
          select: { programming: true, user: true, rating: true },
        }),
    runIds.length === 0
      ? []
      : prisma.credits.findMany({
          where: { programming: { in: runIds }, status: "APPROVED" },
          select: { programming: true, people: { select: { name: true, slug: true } } },
        }),
  ]);

  // Per run: each member's ratings, so repeat visits count once.
  const byRun = new Map<number, Map<number, number[]>>();
  for (const v of visits) {
    if (v.programming == null || v.user == null) continue;
    const people = byRun.get(v.programming) ?? new Map<number, number[]>();
    const ratings = people.get(v.user) ?? [];
    if (v.rating != null) ratings.push(Number(v.rating));
    people.set(v.user, ratings);
    byRun.set(v.programming, people);
  }

  const cutoff = openRunCutoff();
  const now = new Date();
  const productions: HouseProduction[] = runs.flatMap((r) => {
    const title = r.musicals?.title ?? r.plays?.title;
    if (!title) return [];
    const people = byRun.get(r.id) ?? new Map<number, number[]>();
    const perPerson = [...people.values()].map(mean).filter((m): m is number => m != null);
    return [
      {
        id: r.id,
        type: r.type,
        title,
        season: r.seasons?.name ?? null,
        startDate: r.startDate,
        endDate: r.endDate,
        running: r.startDate <= now && r.endDate >= cutoff,
        seenBy: people.size,
        average: perPerson.length >= MIN_RATERS ? mean(perPerson) : null,
      },
    ];
  });

  const bestLoved =
    productions
      .filter((p) => p.average != null)
      .sort((a, b) => (b.average ?? 0) - (a.average ?? 0))[0] ?? null;

  const counts = new Map<string, { name: string; slug: string; runs: Set<number> }>();
  for (const c of credits) {
    const entry = counts.get(c.people.slug) ?? { ...c.people, runs: new Set<number>() };
    entry.runs.add(c.programming);
    counts.set(c.people.slug, entry);
  }
  const people = [...counts.values()]
    .map((p) => ({ name: p.name, slug: p.slug, productions: p.runs.size }))
    .sort((a, b) => b.productions - a.productions || a.name.localeCompare(b.name))
    .slice(0, TOP_PEOPLE);

  return { productions, bestLoved, people };
}

export async function getApprovedNotes(theatreId: number): Promise<HouseNote[]> {
  const notes = await prisma.theatreNotes.findMany({
    where: { theatre: theatreId, status: "APPROVED" },
    select: {
      id: true,
      category: true,
      text: true,
      createdAt: true,
      _count: { select: { votes: true } },
    },
  });
  return notes
    .map((n) => ({
      id: n.id,
      category: n.category,
      text: n.text,
      createdAt: n.createdAt,
      helpful: n._count.votes,
    }))
    .sort((a, b) => b.helpful - a.helpful || b.createdAt.getTime() - a.createdAt.getTime());
}

/** The viewer's side of a theatre page: their nights there, and what they can do with notes. */
export async function getViewerHouse(theatreId: number, userId: number) {
  const today = theatreToday();
  const [visits, votes, pendingNotes] = await Promise.all([
    prisma.attendance.findMany({
      where: {
        user: userId,
        OR: [{ theatre: theatreId }, { performances: { theatre: theatreId } }],
        AND: [{ OR: [{ going: false }, { seenDate: { lt: today } }] }],
      },
      select: {
        programming: true,
        rating: true,
        seenDate: true,
        performances: { select: { startTime: true } },
      },
    }),
    prisma.theatreNoteVotes.findMany({
      where: { user: userId, notes: { theatre: theatreId } },
      select: { note: true },
    }),
    prisma.theatreNotes.count({ where: { theatre: theatreId, user: userId, status: "PENDING" } }),
  ]);
  const days = visits
    .map((v) => visitDay(v.seenDate, v.performances?.startTime))
    .filter((d): d is Date => d != null && d.getTime() > 0)
    .sort((a, b) => a.getTime() - b.getTime());
  const ratings = visits.flatMap((v) => (v.rating == null ? [] : [Number(v.rating)]));
  return {
    nights: visits.length,
    since: days[0] ?? null,
    average: mean(ratings),
    seenRunIds: [...new Set(visits.flatMap((v) => (v.programming == null ? [] : [v.programming])))],
    votedNoteIds: votes.map((v) => v.note),
    pendingNotes,
    canAddNote: visits.length > 0,
  };
}

export type ViewerHouse = Awaited<ReturnType<typeof getViewerHouse>>;
