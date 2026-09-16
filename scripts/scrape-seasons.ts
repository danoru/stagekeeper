// Usage: pnpm scrape:seasons [--theatre <id> [--url <seasonPage>]] [--dry-run] [--verbose]
// Fetches each theatre's season page, extracts runs, and stages them as
// importCandidates for review at /admin/import.

import prisma from "../src/data/db";
import { loadCatalogTitles } from "../src/import/match";
import { listImportableTheatres, runTheatreImport, type ImportSummary } from "../src/import/run";

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(name);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

function fmt(d?: Date) {
  return d ? d.toISOString().slice(0, 10) : "????-??-??";
}

function print(summary: ImportSummary) {
  const head = `${summary.theatreName} (#${summary.theatreId})`;
  if (summary.status !== "OK") {
    console.log(`✗ ${head}: ${summary.status}${summary.error ? ` — ${summary.error}` : ""}`);
    if (summary.sourceUrl) console.log(`    ${summary.sourceUrl}`);
    return;
  }
  console.log(`✓ ${head}: ${summary.runs.length} run(s), ${summary.duplicates} already scheduled`);
  for (const r of summary.runs) {
    const match = r.match ? `→ ${r.match.type} #${r.match.id} ${r.match.title}` : "→ no match";
    console.log(`    ${fmt(r.start)} – ${fmt(r.end)}  ${r.title}  ${match}`);
    if (process.argv.includes("--verbose")) console.log(`        "${r.snippet}"  ${r.sourceUrl}`);
  }
}

async function main() {
  const dryRun = process.argv.includes("--dry-run");
  const only = arg("--theatre");
  const theatres = only ? [{ id: Number(only) }] : await listImportableTheatres();
  const catalog = await loadCatalogTitles();

  for (const t of theatres) {
    const summary = await runTheatreImport(t.id, {
      dryRun,
      catalog,
      sourceUrl: only ? arg("--url") : undefined,
      log: (m) => console.log(m),
    });
    print(summary);
  }
  if (!dryRun) console.log("\nStaged for review at /admin/import");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
