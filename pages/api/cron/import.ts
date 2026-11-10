import { NextApiRequest, NextApiResponse } from "next";

import prisma from "../../../src/data/db";
import { loadCatalogTitles } from "../../../src/import/match";
import { listImportableTheatres, runTheatreImport } from "../../../src/import/run";

// Runs the season importer for every theatre with a page to read, oldest import first, until
// the time budget is spent; whatever is left runs first the next night. Called by Vercel cron
// (vercel.json), which sends `Authorization: Bearer $CRON_SECRET`. New runs still wait in
// /admin/import for an admin: this only finds them.
export const config = { maxDuration: 60 };

const BUDGET_MS = 45_000;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.authorization !== `Bearer ${secret}`) {
    return res.status(401).json({ error: "Unauthorized." });
  }

  const started = Date.now();
  const [theatres, lastRuns, catalog] = await Promise.all([
    listImportableTheatres(),
    prisma.importRuns.groupBy({ by: ["theatre"], _max: { createdAt: true } }),
    loadCatalogTitles(),
  ]);
  const last = new Map(lastRuns.map((r) => [r.theatre, r._max.createdAt?.getTime() ?? 0]));
  const queue = [...theatres].sort((a, b) => (last.get(a.id) ?? 0) - (last.get(b.id) ?? 0));

  const results: { theatre: string; status: string; runs: number }[] = [];
  for (const theatre of queue) {
    if (Date.now() - started > BUDGET_MS) break;
    try {
      const summary = await runTheatreImport(theatre.id, { catalog });
      results.push({ theatre: theatre.name, status: summary.status, runs: summary.runs.length });
    } catch (error) {
      console.error(`Import failed for theatre ${theatre.id}`, error);
      results.push({ theatre: theatre.name, status: "ERROR", runs: 0 });
    }
  }

  return res.status(200).json({
    imported: results.length,
    remaining: queue.length - results.length,
    results,
  });
}
