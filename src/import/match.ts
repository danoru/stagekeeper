import type { PerformanceType } from "@prisma/client";

import prisma from "../data/db";

export type CatalogTitle = {
  id: number;
  title: string;
  type: PerformanceType;
  key: string;
};

/** Fold a title down to something two sites are likely to agree on. */
export function normalizeTitle(input: string): string {
  return input
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/^(the|a|an) /, "")
    .replace(/\s+(the musical|a new musical|in concert|the play|on stage)$/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export async function loadCatalogTitles(): Promise<CatalogTitle[]> {
  const [musicals, plays] = await Promise.all([
    prisma.musicals.findMany({ select: { id: true, title: true } }),
    prisma.plays.findMany({ select: { id: true, title: true } }),
  ]);
  const rows: CatalogTitle[] = [
    ...musicals.map((m) => ({ ...m, type: "MUSICAL" as const, key: normalizeTitle(m.title) })),
    ...plays.map((p) => ({ ...p, type: "PLAY" as const, key: normalizeTitle(p.title) })),
  ];
  // Longest first so "Sweeney Todd: The Demon Barber" wins over "Sweeney Todd" in text scans.
  return rows.filter((r) => r.key.length >= 3).sort((a, b) => b.key.length - a.key.length);
}

export function findCatalogMatch(title: string, catalog: CatalogTitle[]): CatalogTitle | undefined {
  const key = normalizeTitle(title);
  if (!key) return undefined;
  return catalog.find((c) => c.key === key);
}

/** Scan a block of text for any known title (used to name a card whose heading is an image). */
export function findCatalogTitleInText(
  text: string,
  catalog: CatalogTitle[]
): CatalogTitle | undefined {
  const hay = ` ${normalizeTitle(text)} `;
  return catalog.find((c) => c.key.length >= 4 && hay.includes(` ${c.key} `));
}

export type ExistingRun = {
  id: number;
  type: PerformanceType;
  musical: number | null;
  play: number | null;
  startDate: Date;
  endDate: Date;
};

export async function loadExistingRuns(theatreId: number): Promise<ExistingRun[]> {
  return prisma.programming.findMany({
    where: { seasons: { theatre: theatreId } },
    select: { id: true, type: true, musical: true, play: true, startDate: true, endDate: true },
  });
}

/** Programming row for the same show whose dates overlap the candidate. */
export function findExistingRun(
  match: CatalogTitle,
  start: Date | undefined,
  end: Date | undefined,
  existing: ExistingRun[]
): ExistingRun | undefined {
  return existing.find((r) => {
    const sameShow =
      r.type === match.type &&
      (match.type === "MUSICAL" ? r.musical === match.id : r.play === match.id);
    if (!sameShow) return false;
    if (!start || !end) return true;
    return r.startDate <= end && r.endDate >= start;
  });
}
