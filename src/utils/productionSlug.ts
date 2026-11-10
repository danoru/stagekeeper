import { slugify } from "./slug";

// URL part for one production of a show: "<theatre>-<year>", with "-2", "-3" when a theatre
// staged the show twice in one year. Computed from the show's whole list of runs so every
// page and link agrees.

export interface SluggableRun {
  id: number;
  startDate: Date | string;
  theatreName: string | null;
}

export function productionSlugs(runs: SluggableRun[]): Map<number, string> {
  const ordered = [...runs].sort(
    (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime() || a.id - b.id
  );
  const used = new Map<string, number>();
  const out = new Map<number, string>();
  for (const run of ordered) {
    const year = new Date(run.startDate).getUTCFullYear();
    const base = `${slugify(run.theatreName ?? "") || "theatre-tbd"}-${year}`;
    const n = (used.get(base) ?? 0) + 1;
    used.set(base, n);
    out.set(run.id, n === 1 ? base : `${base}-${n}`);
  }
  return out;
}
