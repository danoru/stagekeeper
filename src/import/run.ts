import prisma from "../data/db";

import {
  collectShowLinks,
  extractRuns,
  extractSinglePage,
  parseScrapeConfig,
  type RawRun,
} from "./extract";
import { fetchHtml } from "./fetchPage";
import {
  findExistingRun,
  loadCatalogTitles,
  loadExistingRuns,
  normalizeTitle,
  type CatalogTitle,
} from "./match";

export type ImportStatus = "OK" | "EMPTY" | "BLOCKED" | "ERROR" | "NO_URL";

export type ImportSummary = {
  theatreId: number;
  theatreName: string;
  sourceUrl: string | null;
  status: ImportStatus;
  error?: string;
  runs: RawRun[];
  /** How many of `runs` already exist as programming for this theatre. */
  duplicates: number;
};

type RunOptions = {
  /** Pasted page content; skips the network fetch. */
  html?: string;
  sourceUrl?: string;
  /** Extract only — don't touch importCandidates/importRuns. */
  dryRun?: boolean;
  catalog?: CatalogTitle[];
  log?: (message: string) => void;
};

export async function runTheatreImport(
  theatreId: number,
  opts: RunOptions = {}
): Promise<ImportSummary> {
  const theatre = await prisma.theatres.findUnique({
    where: { id: theatreId },
    select: { id: true, name: true, link: true, seasonUrl: true, scrapeConfig: true },
  });
  if (!theatre) throw new Error(`Theatre ${theatreId} not found.`);

  const sourceUrl = opts.sourceUrl ?? theatre.seasonUrl ?? theatre.link ?? null;
  const base: ImportSummary = {
    theatreId,
    theatreName: theatre.name,
    sourceUrl,
    status: "OK",
    runs: [],
    duplicates: 0,
  };
  if (!opts.html && !sourceUrl) return { ...base, status: "NO_URL" };

  const catalog = opts.catalog ?? (await loadCatalogTitles());
  const config = parseScrapeConfig(theatre.scrapeConfig);
  const baseUrl = sourceUrl ?? `pasted://theatre/${theatreId}`;

  let html = opts.html;
  if (!html) {
    const fetched = await fetchHtml(sourceUrl!);
    if (!fetched.ok) {
      const summary = { ...base, status: fetched.reason, error: fetched.detail };
      if (!opts.dryRun) await recordRun(summary);
      return summary;
    }
    html = fetched.html;
  }

  let runs = extractRuns(html, { baseUrl, catalog, config });
  opts.log?.(`  season page: ${runs.length} run(s)`);

  // Listing pages that only link out to show pages (or that render titles as
  // images) need one more hop.
  if (sourceUrl && (runs.length <= 1 || config?.follow)) {
    const links = collectShowLinks(html, sourceUrl);
    opts.log?.(`  following ${links.length} show link(s)`);
    for (const link of links) {
      const page = await fetchHtml(link);
      if (!page.ok) continue;
      const run = extractSinglePage(page.html, { baseUrl: link, catalog, config });
      if (run && run.start) runs.push(run);
    }
    runs = dedupeRuns(runs);
  }

  const existing = await loadExistingRuns(theatreId);
  // Runs the admin already skipped stay skipped on re-fetch.
  const skipped = new Set(
    (
      await prisma.importCandidates.findMany({
        where: { theatre: theatreId, state: "SKIPPED" },
        select: { rawTitle: true, startDate: true },
      })
    ).map((c) => candidateKey(c.rawTitle, c.startDate))
  );
  let duplicates = 0;
  const rows = runs
    .filter((run) => !skipped.has(candidateKey(run.title, run.start)))
    .map((run) => {
      const dup = run.match ? findExistingRun(run.match, run.start, run.end, existing) : undefined;
      if (dup) duplicates++;
      return { run, dup };
    });

  const summary: ImportSummary = {
    ...base,
    status: runs.length === 0 ? "EMPTY" : "OK",
    runs,
    duplicates,
  };
  if (opts.dryRun) return summary;

  await prisma.$transaction([
    prisma.importCandidates.deleteMany({
      where: { theatre: theatreId, state: { in: ["NEW", "DUPLICATE"] } },
    }),
    prisma.importCandidates.createMany({
      data: rows.map(({ run, dup }) => ({
        theatre: theatreId,
        sourceUrl: run.sourceUrl,
        rawTitle: run.title,
        startDate: run.start ?? null,
        endDate: run.end ?? null,
        snippet: run.snippet.slice(0, 300),
        matchType: run.match?.type ?? null,
        matchMusical: run.match?.type === "MUSICAL" ? run.match.id : null,
        matchPlay: run.match?.type === "PLAY" ? run.match.id : null,
        existingProgramming: dup?.id ?? null,
        state: dup ? "DUPLICATE" : "NEW",
      })),
    }),
  ]);
  await recordRun(summary);
  return summary;
}

async function recordRun(summary: ImportSummary) {
  await prisma.importRuns.create({
    data: {
      theatre: summary.theatreId,
      sourceUrl: summary.sourceUrl ?? "",
      status: summary.status,
      itemCount: summary.runs.length,
      error: summary.error ?? null,
    },
  });
}

function candidateKey(title: string, start: Date | null | undefined) {
  return `${normalizeTitle(title)}|${start?.toISOString() ?? ""}`;
}

function dedupeRuns(runs: RawRun[]): RawRun[] {
  const seen = new Map<string, RawRun>();
  for (const r of runs) {
    const key = `${r.match ? `${r.match.type}:${r.match.id}` : r.title.toLowerCase()}|${r.start?.toISOString() ?? ""}`;
    if (!seen.has(key)) seen.set(key, r);
  }
  return [...seen.values()];
}

/** Theatres that have something to scrape, for the CLI and the admin page. */
export async function listImportableTheatres() {
  return prisma.theatres.findMany({
    where: { OR: [{ seasonUrl: { not: null } }, { link: { not: null } }] },
    select: { id: true, name: true, link: true, seasonUrl: true },
    orderBy: { name: "asc" },
  });
}
