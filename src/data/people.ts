import type { CreditCategory, Prisma } from "@prisma/client";

import { usesCharacter } from "../components/people/creditText";
import { visitProduction, type RunRef } from "../utils/productions";
import { mean } from "../utils/ratings";
import { openRunCutoff, theatreToday, visitDay } from "../utils/schedule";
import { slugify } from "../utils/slug";

import prisma from "./db";

export const CREDIT_CATEGORIES: CreditCategory[] = [
  "CAST",
  "UNDERSTUDY",
  "CREATIVE",
  "MUSICIAN",
  "CREW",
];

const MAX_TEXT = 120;

// A production is a programming run: one show at one theatre for one stretch of dates.
export const productionSelect = {
  id: true,
  type: true,
  startDate: true,
  endDate: true,
  musicals: { select: { id: true, title: true, playbill: true } },
  plays: { select: { id: true, title: true, playbill: true } },
  seasons: { select: { theatres: { select: { id: true, name: true, location: true } } } },
} satisfies Prisma.programmingSelect;

export type Production = Prisma.programmingGetPayload<{ select: typeof productionSelect }>;

export interface CreditPart {
  category: CreditCategory;
  role: string | null;
  character: string | null;
}

const creditOrder: Prisma.creditsOrderByWithRelationInput[] = [
  { category: "asc" },
  { billing: "asc" },
  { id: "asc" },
];

type Tx = Prisma.TransactionClient | typeof prisma;

/** "jane-doe", or "jane-doe-2" when that's taken. */
export async function createPersonSlug(name: string, tx: Tx = prisma): Promise<string> {
  const base = slugify(name) || "person";
  const taken = await tx.people.findMany({
    where: { slug: { startsWith: base } },
    select: { slug: true },
  });
  const used = new Set(taken.map((t) => t.slug));
  if (!used.has(base)) return base;
  for (let i = 2; ; i++) {
    if (!used.has(`${base}-${i}`)) return `${base}-${i}`;
  }
}

export async function getPersonBySlug(slug: string) {
  return prisma.people.findUnique({
    where: { slug },
    select: { id: true, name: true, slug: true, bio: true, disambiguator: true, status: true },
  });
}

export interface PersonProduction {
  production: Production;
  parts: CreditPart[];
  seenByViewer: boolean;
}

/** Approved credits, one entry per production, split into current/upcoming and past runs. */
export async function getPersonCredits(personId: number, viewerId: number | null) {
  const credits = await prisma.credits.findMany({
    where: { person: personId, status: "APPROVED" },
    select: {
      category: true,
      role: true,
      character: true,
      programmings: { select: productionSelect },
    },
    orderBy: [{ programmings: { startDate: "desc" } }, ...creditOrder],
  });

  const byProduction = new Map<number, PersonProduction>();
  for (const c of credits) {
    const entry = byProduction.get(c.programmings.id) ?? {
      production: c.programmings,
      parts: [],
      seenByViewer: false,
    };
    entry.parts.push({ category: c.category, role: c.role, character: c.character });
    byProduction.set(c.programmings.id, entry);
  }
  const productions = [...byProduction.values()];

  if (viewerId != null) {
    const seen = await getSeenProductionIds(
      viewerId,
      productions.map((p) => p.production)
    );
    for (const p of productions) p.seenByViewer = seen.has(p.production.id);
  }

  const cutoff = openRunCutoff();
  return {
    current: productions
      .filter((p) => p.production.endDate >= cutoff)
      .sort((a, b) => a.production.startDate.getTime() - b.production.startDate.getTime()),
    past: productions.filter((p) => p.production.endDate < cutoff),
  };
}

function asRun(p: Production): RunRef {
  return {
    id: p.id,
    theatreId: p.seasons?.theatres.id ?? null,
    startDate: p.startDate,
    endDate: p.endDate,
  };
}

/** Productions the viewer has a past visit for (see utils/productions.ts for the rule). */
async function getSeenProductionIds(viewerId: number, productions: Production[]) {
  const musicalIds = productions.flatMap((p) => (p.musicals ? [p.musicals.id] : []));
  const playIds = productions.flatMap((p) => (p.plays ? [p.plays.id] : []));
  if (musicalIds.length === 0 && playIds.length === 0) return new Set<number>();

  const visits = await prisma.attendance.findMany({
    where: {
      user: viewerId,
      OR: [
        { musical: { in: musicalIds } },
        { play: { in: playIds } },
        { performances: { OR: [{ musical: { in: musicalIds } }, { play: { in: playIds } }] } },
      ],
      AND: [{ OR: [{ going: false }, { seenDate: { lt: theatreToday() } }] }],
    },
    select: {
      musical: true,
      play: true,
      theatre: true,
      seenDate: true,
      programming: true,
      performances: { select: { musical: true, play: true, theatre: true, startTime: true } },
    },
  });

  const seen = new Set<number>();
  for (const v of visits) {
    const musical = v.musical ?? v.performances?.musical ?? null;
    const play = v.play ?? v.performances?.play ?? null;
    const runs = productions
      .filter((p) => (p.musicals ? p.musicals.id === musical : p.plays?.id === play))
      .map(asRun);
    const id = visitProduction(
      {
        programming: v.programming,
        theatreId: v.theatre ?? v.performances?.theatre ?? null,
        date: visitDay(v.seenDate, v.performances?.startTime),
      },
      runs
    );
    if (id != null) seen.add(id);
  }
  return seen;
}

/** Approved people matching `q`, with their latest credit to tell same-name people apart. */
export async function searchPeople(q: string, take = 10) {
  const query = q.trim();
  if (query.length < 2) return [];
  const people = await prisma.people.findMany({
    where: { status: "APPROVED", name: { contains: query, mode: "insensitive" } },
    select: {
      id: true,
      name: true,
      slug: true,
      disambiguator: true,
      credits: {
        where: { status: "APPROVED" },
        select: { programmings: { select: productionSelect } },
        orderBy: { programmings: { startDate: "desc" } },
        take: 1,
      },
      _count: { select: { credits: { where: { status: "APPROVED" } } } },
    },
    orderBy: { name: "asc" },
    take,
  });
  return people.map((p) => {
    const latest = p.credits[0]?.programmings;
    const title = latest?.musicals?.title ?? latest?.plays?.title ?? null;
    const theatre = latest?.seasons?.theatres.name ?? null;
    return {
      id: p.id,
      name: p.name,
      slug: p.slug,
      disambiguator: p.disambiguator,
      credits: p._count.credits,
      latest: title ? [title, theatre].filter(Boolean).join(" · ") : null,
    };
  });
}

export type PersonSearchResult = Awaited<ReturnType<typeof searchPeople>>[number];

export interface ProductionCredit extends CreditPart {
  id: number;
  person: { name: string; slug: string };
}

export interface ProductionStats {
  /** Mean of each attendee's mean rating for this run, so repeat visits count once. */
  average: number | null;
  raters: number;
  seenBy: number;
}

/** Every run of a show, newest first, with its approved credits and audience stats. */
export async function getShowProductions(show: { musical: number } | { play: number }) {
  const [runs, visits] = await Promise.all([
    prisma.programming.findMany({
      where: show,
      select: {
        ...productionSelect,
        credits: {
          where: { status: "APPROVED" },
          select: {
            id: true,
            category: true,
            role: true,
            character: true,
            people: { select: { name: true, slug: true } },
          },
          orderBy: creditOrder,
        },
      },
      orderBy: { startDate: "desc" },
    }),
    prisma.attendance.findMany({
      where: {
        AND: [
          { OR: [show, { performances: show }] },
          { OR: [{ going: false }, { seenDate: { lt: theatreToday() } }] },
        ],
      },
      select: {
        user: true,
        rating: true,
        theatre: true,
        seenDate: true,
        programming: true,
        performances: { select: { theatre: true, startTime: true } },
      },
    }),
  ]);

  // Pin each visit to a run, then collect per-person ratings for each run.
  const refs = runs.map(asRun);
  const byRun = new Map<number, Map<number, number[]>>();
  for (const v of visits) {
    if (v.user == null) continue;
    const runId = visitProduction(
      {
        programming: v.programming,
        theatreId: v.theatre ?? v.performances?.theatre ?? null,
        date: visitDay(v.seenDate, v.performances?.startTime),
      },
      refs
    );
    if (runId == null) continue;
    const people = byRun.get(runId) ?? new Map<number, number[]>();
    const ratings = people.get(v.user) ?? [];
    if (v.rating != null) ratings.push(Number(v.rating));
    people.set(v.user, ratings);
    byRun.set(runId, people);
  }

  return runs.map(({ credits, ...production }) => {
    const people = byRun.get(production.id) ?? new Map<number, number[]>();
    const perPerson = [...people.values()].map(mean).filter((v): v is number => v != null);
    const stats: ProductionStats = {
      average: mean(perPerson),
      raters: perPerson.length,
      seenBy: people.size,
    };
    return {
      production,
      stats,
      credits: credits.map(({ people, ...c }): ProductionCredit => ({ ...c, person: people })),
    };
  });
}

export type ShowProduction = Awaited<ReturnType<typeof getShowProductions>>[number];

/** Whether the user has a past visit to the show (any production). */
export async function hasSeenShow(userId: number, show: { musical: number } | { play: number }) {
  const visit = await prisma.attendance.findFirst({
    where: {
      user: userId,
      AND: [
        { OR: [show, { performances: show }] },
        { OR: [{ going: false }, { seenDate: { lt: theatreToday() } }] },
      ],
    },
    select: { id: true },
  });
  return visit != null;
}

/** Thrown when a typed name matches more than one approved person and none was picked. */
export class AmbiguousPersonError extends Error {
  constructor(public readonly personName: string) {
    super(`More than one ${personName} is on StageKeeper. Pick which one from the list.`);
  }
}

export interface CreditSuggestion {
  personId?: number | null;
  name: string;
  category: CreditCategory;
  character?: string | null;
  role?: string | null;
}

function cleanText(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.replace(/\s+/g, " ").trim();
  return trimmed ? trimmed.slice(0, MAX_TEXT) : null;
}

/** Validates one submitted row, or returns an error message. */
export function parseSuggestion(raw: unknown): CreditSuggestion | string {
  if (!raw || typeof raw !== "object") return "Each credit needs a name.";
  const row = raw as Record<string, unknown>;
  const name = cleanText(row.name);
  if (!name || name.length < 2) return "Each credit needs a name.";
  if (!CREDIT_CATEGORIES.includes(row.category as CreditCategory)) {
    return "Category must be CAST, UNDERSTUDY, CREATIVE, MUSICIAN or CREW.";
  }
  const personId = Number(row.personId);
  return {
    personId: Number.isInteger(personId) && personId > 0 ? personId : null,
    name,
    category: row.category as CreditCategory,
    character: cleanText(row.character),
    role: cleanText(row.role),
  };
}

/**
 * Stores suggested credits for a production. Each name links to the chosen person, else to an
 * existing person with exactly that name, else to a new PENDING person. Rows already on the
 * production are skipped. Admin submissions are approved immediately.
 */
export async function submitCredits(args: {
  programmingId: number;
  userId: number;
  approve: boolean;
  rows: CreditSuggestion[];
}) {
  const status = args.approve ? "APPROVED" : "PENDING";
  return prisma.$transaction(async (tx) => {
    const existing = await tx.credits.findMany({
      where: { programming: args.programmingId },
      select: { person: true, category: true, character: true, role: true, billing: true },
    });
    const key = (
      person: number,
      c: { category: string; character?: string | null; role?: string | null }
    ) =>
      `${person}|${c.category}|${(c.character ?? "").toLowerCase()}|${(c.role ?? "").toLowerCase()}`;
    const seen = new Set(existing.map((e) => key(e.person, e)));
    let billing = existing.reduce((max, e) => Math.max(max, e.billing), 0);

    const result = { created: 0, linked: 0, newPeople: 0, skipped: 0 };
    for (const row of args.rows) {
      let personId: number | null = null;
      if (row.personId) {
        const chosen = await tx.people.findUnique({
          where: { id: row.personId },
          select: { id: true },
        });
        personId = chosen?.id ?? null;
      }
      if (personId == null) {
        const matches = await tx.people.findMany({
          where: { name: { equals: row.name, mode: "insensitive" } },
          // ContentStatus is declared PENDING, APPROVED; prefer the approved person.
          orderBy: [{ status: "desc" }, { id: "asc" }],
          select: { id: true, status: true },
        });
        const approved = matches.filter((m) => m.status === "APPROVED");
        // Two approved people share this name: guessing would credit the wrong one.
        if (approved.length > 1) throw new AmbiguousPersonError(row.name);
        personId = matches[0]?.id ?? null;
      }
      if (personId == null) {
        const created = await tx.people.create({
          data: {
            name: row.name,
            slug: await createPersonSlug(row.name, tx),
            status,
            createdBy: args.userId,
          },
          select: { id: true },
        });
        personId = created.id;
        result.newPeople += 1;
      } else {
        result.linked += 1;
      }

      const k = key(personId, row);
      if (seen.has(k)) {
        result.skipped += 1;
        continue;
      }
      seen.add(k);
      billing += 1;
      await tx.credits.create({
        data: {
          programming: args.programmingId,
          person: personId,
          category: row.category,
          character: usesCharacter(row.category) ? (row.character ?? null) : null,
          role: usesCharacter(row.category) ? null : (row.role ?? null),
          billing,
          status,
          suggestedBy: args.userId,
        },
      });
      result.created += 1;
    }
    return result;
  });
}

/** Pending suggestions for the admin queue, grouped by production. */
export async function getPendingCredits() {
  const rows = await prisma.credits.findMany({
    where: { status: "PENDING" },
    select: {
      id: true,
      createdAt: true,
      category: true,
      role: true,
      character: true,
      people: { select: { id: true, name: true, slug: true, status: true } },
      suggester: { select: { username: true } },
      programmings: { select: productionSelect },
    },
    orderBy: [{ programming: "asc" }, ...creditOrder],
  });

  const groups = new Map<number, { production: Production; credits: typeof rows }>();
  for (const row of rows) {
    const group = groups.get(row.programmings.id) ?? { production: row.programmings, credits: [] };
    group.credits.push(row);
    groups.set(row.programmings.id, group);
  }
  return [...groups.values()];
}

export type PendingCreditGroup = Awaited<ReturnType<typeof getPendingCredits>>[number];
