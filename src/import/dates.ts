// Date-range detection for season pages. Theatre sites write runs in many
// shapes ("October 16-November 1, 2026", "AUGUST 14TH - 29TH", "9/12 – 10/5"),
// so this is intentionally regex-based rather than a full date parser.

export type DateRange = {
  start: Date;
  end: Date;
  raw: string;
  /** True when the page stated at least one year explicitly. */
  explicitYear: boolean;
};

const MONTHS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];

const MON = String.raw`(?:jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|june?|july?|aug(?:ust)?|sep(?:t(?:ember)?)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\.?`;
const DAY = String.raw`(\d{1,2})(?:st|nd|rd|th)?`;
const YEAR = String.raw`(?:,?\s*(\d{4}))?`;
const DASH = String.raw`\s*(?:-|–|—|to|through|thru|until)\s*`;
const WEEKDAY = String.raw`(?:(?:mon|tues?|wed(?:nes)?|thu(?:rs)?|fri|sat(?:ur)?|sun)(?:day)?\.?,?\s+)?`;

// "October 16 – November 1, 2026" / "Aug 14th - 29th" / "May 2 - May 30, 2027"
const WORDY = new RegExp(
  String.raw`${WEEKDAY}(${MON})\s+${DAY}${YEAR}${DASH}${WEEKDAY}(?:(${MON})\s+)?${DAY}${YEAR}`,
  "gi"
);
// "11/6/26 – 11/22/26" / "9/12 - 10/5"
const NUMERIC = new RegExp(
  String.raw`\b(\d{1,2})/(\d{1,2})(?:/(\d{2,4}))?${DASH}(\d{1,2})/(\d{1,2})(?:/(\d{2,4}))?\b`,
  "gi"
);
// "2026-27 Season", "2026/2027", "26/27 SEASON"
const SEASON_LABEL = /\b(20\d{2}|\d{2})\s*[-–/]\s*(\d{2}|20\d{2})\b(?=[^\d]|$)/;

export type YearHint = { kind: "split"; startYear: number } | { kind: "single"; year: number };

/** Find a "2026-27" or "2026 Season" label to anchor year-less dates. */
export function findSeasonYearHint(text: string): YearHint | undefined {
  const split = text.match(SEASON_LABEL);
  if (split) {
    const a = Number(split[1].length === 2 ? `20${split[1]}` : split[1]);
    const b = Number(split[2].length === 2 ? `20${split[2]}` : split[2]);
    if (b === a + 1 && a > 2000 && a < 2100) return { kind: "split", startYear: a };
  }
  const single = text.match(/\b(20\d{2})\s+season\b/i);
  if (single) return { kind: "single", year: Number(single[1]) };
  return undefined;
}

function monthIndex(name: string): number {
  return MONTHS.indexOf(name.slice(0, 3).toLowerCase());
}

function normalizeYear(raw: string | undefined): number | undefined {
  if (!raw) return undefined;
  const n = Number(raw);
  return raw.length === 2 ? 2000 + n : n;
}

/** Year a month falls in given a season hint (Aug–Dec → first year of a split season). */
function inferYear(month: number, hint: YearHint | undefined, now: Date): number {
  if (hint?.kind === "split") return month >= 6 ? hint.startYear : hint.startYear + 1;
  if (hint?.kind === "single") return hint.year;
  // No hint: assume the nearest upcoming occurrence (allow ~3 months in the past).
  const year = now.getUTCFullYear();
  const monthsAgo = now.getUTCMonth() - month;
  return monthsAgo > 3 ? year + 1 : year;
}

function utcNoon(year: number, month: number, day: number): Date | undefined {
  if (month < 0 || month > 11 || day < 1 || day > 31) return undefined;
  const d = new Date(Date.UTC(year, month, day, 12));
  return d.getUTCMonth() === month ? d : undefined;
}

function build(
  raw: string,
  startMonth: number,
  startDay: number,
  startYearRaw: string | undefined,
  endMonth: number,
  endDay: number,
  endYearRaw: string | undefined,
  hint: YearHint | undefined,
  now: Date
): DateRange | undefined {
  let startYear = normalizeYear(startYearRaw);
  let endYear = normalizeYear(endYearRaw);
  const explicitYear = startYear !== undefined || endYear !== undefined;
  if (startYear === undefined && endYear !== undefined) {
    startYear = startMonth > endMonth ? endYear - 1 : endYear;
  }
  if (startYear === undefined) startYear = inferYear(startMonth, hint, now);
  if (endYear === undefined) endYear = endMonth < startMonth ? startYear + 1 : startYear;
  const start = utcNoon(startYear, startMonth, startDay);
  const end = utcNoon(endYear, endMonth, endDay);
  if (!start || !end || end < start) return undefined;
  // A "run" longer than a year is almost certainly a mis-parse.
  if (end.getTime() - start.getTime() > 400 * 86_400_000) return undefined;
  return { start, end, raw, explicitYear };
}

export function findDateRanges(text: string, hint?: YearHint, now: Date = new Date()): DateRange[] {
  const out: DateRange[] = [];
  for (const m of text.matchAll(WORDY)) {
    const [raw, m1, d1, y1, m2, d2, y2] = m;
    const startMonth = monthIndex(m1);
    const endMonth = m2 ? monthIndex(m2) : startMonth;
    const r = build(raw, startMonth, Number(d1), y1, endMonth, Number(d2), y2, hint, now);
    if (r) out.push(r);
  }
  for (const m of text.matchAll(NUMERIC)) {
    const [raw, m1, d1, y1, m2, d2, y2] = m;
    const r = build(raw, Number(m1) - 1, Number(d1), y1, Number(m2) - 1, Number(d2), y2, hint, now);
    if (r) out.push(r);
  }
  return out;
}

const WORDY_TEST = new RegExp(WORDY.source, "i");
const NUMERIC_TEST = new RegExp(NUMERIC.source, "i");

/** Quick test used to decide whether an element is worth walking. */
export function containsDateRange(text: string): boolean {
  return WORDY_TEST.test(text) || NUMERIC_TEST.test(text);
}
