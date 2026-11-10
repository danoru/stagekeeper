import { mean } from "./ratings";

// A group's shared theatregoing: shows two or more members saw on the same day, how each rated
// them, and a few light superlatives. Pure, so it can be checked without a database.

export interface LedgerVisit {
  userId: number;
  showKey: string;
  title: string;
  /** Calendar day, UTC midnight. */
  day: Date;
  rating: number | null;
}

export interface LedgerShow {
  showKey: string;
  title: string;
  day: Date;
  /** Each attending member's rating (null when they didn't rate). */
  ratings: Map<number, number | null>;
  average: number | null;
}

export interface Ledger {
  shows: LedgerShow[];
  biggestSplit: { show: LedgerShow; high: [number, number]; low: [number, number] } | null;
  toughCritic: { userId: number; below: number } | null;
  agreeablePair: { a: number; b: number; close: number; of: number } | null;
}

/** Minimum shared shows before the ledger shows up at all. */
export const LEDGER_MIN_SHOWS = 3;

export function buildLedger(visits: LedgerVisit[], year?: number): Ledger {
  const groups = new Map<string, LedgerVisit[]>();
  for (const v of visits) {
    if (year && v.day.getUTCFullYear() !== year) continue;
    const key = `${v.showKey}|${v.day.getTime()}`;
    groups.set(key, [...(groups.get(key) ?? []), v]);
  }

  const shows: LedgerShow[] = [];
  for (const group of groups.values()) {
    const ratings = new Map<number, number | null>();
    for (const v of group) {
      const prev = ratings.get(v.userId);
      // A member who logged the night twice keeps the rating they gave.
      ratings.set(v.userId, prev ?? v.rating);
    }
    if (ratings.size < 2) continue;
    const rated = [...ratings.values()].filter((r): r is number => r != null);
    shows.push({
      showKey: group[0].showKey,
      title: group[0].title,
      day: group[0].day,
      ratings,
      average: mean(rated),
    });
  }
  shows.sort((a, b) => b.day.getTime() - a.day.getTime());

  // Biggest split: the widest gap between two members on one night.
  let biggestSplit: Ledger["biggestSplit"] = null;
  for (const show of shows) {
    const rated = [...show.ratings.entries()].filter((e): e is [number, number] => e[1] != null);
    if (rated.length < 2) continue;
    const high = rated.reduce((a, b) => (b[1] > a[1] ? b : a));
    const low = rated.reduce((a, b) => (b[1] < a[1] ? b : a));
    if (high[1] - low[1] < 1) continue;
    if (!biggestSplit || high[1] - low[1] > biggestSplit.high[1] - biggestSplit.low[1]) {
      biggestSplit = { show, high, low };
    }
  }

  // Tough critic: on average furthest below the others on the same nights (3+ rated shows).
  const gaps = new Map<number, number[]>();
  for (const show of shows) {
    const rated = [...show.ratings.entries()].filter((e): e is [number, number] => e[1] != null);
    if (rated.length < 2) continue;
    for (const [user, rating] of rated) {
      const others = mean(rated.filter(([u]) => u !== user).map(([, r]) => r))!;
      gaps.set(user, [...(gaps.get(user) ?? []), rating - others]);
    }
  }
  let toughCritic: Ledger["toughCritic"] = null;
  for (const [userId, list] of gaps) {
    if (list.length < 3) continue;
    const avg = mean(list)!;
    if (avg < -0.25 && (!toughCritic || -avg > toughCritic.below)) {
      toughCritic = { userId, below: -avg };
    }
  }

  // Most agreeable pair: within half a star on the most shared rated nights.
  const pairs = new Map<string, { a: number; b: number; close: number; of: number }>();
  for (const show of shows) {
    const rated = [...show.ratings.entries()].filter((e): e is [number, number] => e[1] != null);
    for (let i = 0; i < rated.length; i++) {
      for (let j = i + 1; j < rated.length; j++) {
        const [a, b] = rated[i][0] < rated[j][0] ? [rated[i], rated[j]] : [rated[j], rated[i]];
        const key = `${a[0]}|${b[0]}`;
        const entry = pairs.get(key) ?? { a: a[0], b: b[0], close: 0, of: 0 };
        entry.of += 1;
        if (Math.abs(a[1] - b[1]) <= 0.5) entry.close += 1;
        pairs.set(key, entry);
      }
    }
  }
  const agreeablePair =
    [...pairs.values()]
      .filter((p) => p.of >= 3 && p.close / p.of >= 0.6)
      .sort((x, y) => y.close / y.of - x.close / x.of || y.of - x.of)[0] ?? null;

  return { shows, biggestSplit, toughCritic, agreeablePair };
}
