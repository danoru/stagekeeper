import type { Prisma } from "@prisma/client";

import { closeNames, normalizePersonName } from "../utils/personNames";

import prisma from "./db";
import { createPersonSlug, productionSelect } from "./people";

// Admin tools for people: "same person?" suggestions, merge, split and naming. A typo in a
// suggested credit creates a second person; an exact-name match links two different people.
// These fix both without touching the credits' productions.

const MAX_SUGGESTIONS = 20;

const creditSelect = {
  id: true,
  category: true,
  character: true,
  role: true,
  status: true,
  programmings: { select: productionSelect },
} satisfies Prisma.creditsSelect;

export type AdminCredit = Prisma.creditsGetPayload<{ select: typeof creditSelect }>;

export interface AdminPerson {
  id: number;
  name: string;
  slug: string;
  disambiguator: string | null;
  status: string;
  createdAt: Date;
  credits: AdminCredit[];
}

const personSelect = {
  id: true,
  name: true,
  slug: true,
  disambiguator: true,
  status: true,
  createdAt: true,
  credits: { select: creditSelect, orderBy: { programmings: { startDate: "desc" } } },
} satisfies Prisma.peopleSelect;

export interface PersonPair {
  a: AdminPerson;
  b: AdminPerson;
  reason: string;
}

function theatresOf(p: AdminPerson): Set<number> {
  return new Set(
    p.credits.flatMap((c) => {
      const id = c.programmings.seasons?.theatres.id;
      return id == null ? [] : [id];
    })
  );
}

/**
 * Pairs that look like one person: the same name once punctuation and accents are ignored, or
 * names one or two letters apart that share a theatre. People an admin has told apart with
 * different disambiguators are left alone.
 */
export async function getSamePersonSuggestions(): Promise<PersonPair[]> {
  const people = (await prisma.people.findMany({ select: personSelect })) as AdminPerson[];
  const norm = people.map((p) => normalizePersonName(p.name));
  const pairs: PersonPair[] = [];

  for (let i = 0; i < people.length; i++) {
    for (let j = i + 1; j < people.length; j++) {
      const a = people[i];
      const b = people[j];
      if (a.disambiguator && b.disambiguator && a.disambiguator !== b.disambiguator) continue;
      let reason: string | null = null;
      if (norm[i] === norm[j]) {
        reason = "Same name";
      } else if (closeNames(norm[i], norm[j])) {
        const shared = [...theatresOf(a)].filter((t) => theatresOf(b).has(t));
        if (shared.length > 0) {
          const theatre = a.credits
            .map((c) => c.programmings.seasons?.theatres)
            .find((t) => t && shared.includes(t.id));
          reason = `Spelled almost the same; both credited at ${theatre?.name ?? "one theatre"}`;
        }
      }
      if (!reason) continue;
      // The older person is the one to keep by default.
      const [keep, fold] = a.createdAt <= b.createdAt ? [a, b] : [b, a];
      pairs.push({ a: keep, b: fold, reason });
      if (pairs.length >= MAX_SUGGESTIONS) return pairs;
    }
  }
  return pairs;
}

export async function getAdminPerson(id: number): Promise<AdminPerson | null> {
  return (await prisma.people.findUnique({
    where: { id },
    select: personSelect,
  })) as AdminPerson | null;
}

export async function searchAdminPeople(q: string) {
  const query = q.trim();
  if (query.length < 2) return [];
  return prisma.people.findMany({
    where: { name: { contains: query, mode: "insensitive" } },
    select: {
      id: true,
      name: true,
      disambiguator: true,
      status: true,
      _count: { select: { credits: true } },
    },
    orderBy: { name: "asc" },
    take: 15,
  });
}

function creditKey(c: {
  programming: number;
  category: string;
  character: string | null;
  role: string | null;
}) {
  return `${c.programming}|${c.category}|${(c.character ?? "").toLowerCase()}|${(c.role ?? "").toLowerCase()}`;
}

/**
 * Moves every credit from `fromId` to `intoId` and removes `fromId`. A credit the kept person
 * already has on the same production is dropped rather than doubled. The kept person keeps
 * their name and takes the other's bio and disambiguator only where they have none.
 */
export async function mergePeople(fromId: number, intoId: number) {
  if (fromId === intoId) throw new Error("Pick two different people.");
  return prisma.$transaction(async (tx) => {
    const [from, into] = await Promise.all([
      tx.people.findUnique({ where: { id: fromId } }),
      tx.people.findUnique({ where: { id: intoId } }),
    ]);
    if (!from || !into) throw new Error("Person not found.");

    const [fromCredits, intoCredits] = await Promise.all([
      tx.credits.findMany({ where: { person: fromId } }),
      tx.credits.findMany({ where: { person: intoId } }),
    ]);
    const kept = new Set(intoCredits.map(creditKey));
    let moved = 0;
    let dropped = 0;
    for (const credit of fromCredits) {
      if (kept.has(creditKey(credit))) {
        await tx.credits.delete({ where: { id: credit.id } });
        dropped += 1;
      } else {
        await tx.credits.update({ where: { id: credit.id }, data: { person: intoId } });
        kept.add(creditKey(credit));
        moved += 1;
      }
    }
    await tx.people.update({
      where: { id: intoId },
      data: {
        bio: into.bio ?? from.bio,
        disambiguator: into.disambiguator ?? from.disambiguator,
        status: into.status === "APPROVED" || from.status === "APPROVED" ? "APPROVED" : "PENDING",
      },
    });
    await tx.people.delete({ where: { id: fromId } });
    return { moved, dropped };
  });
}

/** Moves the chosen credits of `personId` to a new person, for two people linked by one name. */
export async function splitPerson(args: {
  personId: number;
  creditIds: number[];
  name: string;
  disambiguator: string | null;
}) {
  return prisma.$transaction(async (tx) => {
    const credits = await tx.credits.findMany({
      where: { person: args.personId, id: { in: args.creditIds } },
      select: { id: true, status: true },
    });
    if (credits.length === 0) throw new Error("Pick at least one credit to move.");
    const total = await tx.credits.count({ where: { person: args.personId } });
    if (credits.length === total) {
      throw new Error("Leave at least one credit with this person; rename them instead.");
    }
    const created = await tx.people.create({
      data: {
        name: args.name,
        slug: await createPersonSlug(args.name, tx),
        disambiguator: args.disambiguator,
        status: credits.some((c) => c.status === "APPROVED") ? "APPROVED" : "PENDING",
      },
      select: { id: true, slug: true },
    });
    await tx.credits.updateMany({
      where: { id: { in: credits.map((c) => c.id) } },
      data: { person: created.id },
    });
    return created;
  });
}

export async function updatePersonNaming(
  id: number,
  data: { name?: string; disambiguator?: string | null }
) {
  return prisma.people.update({
    where: { id },
    data,
    select: { id: true, name: true, disambiguator: true },
  });
}
