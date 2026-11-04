// Showtime expansion shared by the calendars and the group plan picker. Kept free of
// moment-timezone so it doesn't pull the zone database into the browser bundle.

// Every theatre in the catalog is in California; showtimes are wall-clock times there.
export const THEATRE_TZ = "America/Los_Angeles";

export type DayTimes = Record<string, string[]>;

/** Typical week when a run has no published showtimes. These are estimates. */
export const DEFAULT_DAY_TIMES: DayTimes = {
  Tuesday: ["20:00"],
  Wednesday: ["20:00"],
  Thursday: ["20:00"],
  Friday: ["20:00"],
  Saturday: ["14:00", "20:00"],
  Sunday: ["13:00", "18:30"],
};

const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const DAY_MS = 86_400_000;

/** True when `raw` has at least one usable "HH:mm" entry. */
export function hasDayTimes(raw: unknown): raw is DayTimes {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return false;
  return Object.values(raw).some((times) => Array.isArray(times) && times.length > 0);
}

/** Stored pattern, or the estimated default when the run has none (`{}` included). */
export function resolveDayTimes(raw: unknown): DayTimes {
  return hasDayTimes(raw) ? raw : DEFAULT_DAY_TIMES;
}

export const WEEK_ORDER = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

/** "2pm", "2:30 PM", "14:00" → "14:00"; null when it isn't a time. */
export function parseTime(text: string): string | null {
  const m = text.trim().match(/^(\d{1,2})(?::(\d{2}))?\s*([ap])\.?m?\.?$|^(\d{1,2}):(\d{2})$/i);
  if (!m) return null;
  const minute = Number(m[2] ?? m[5] ?? 0);
  let hour = Number(m[1] ?? m[4]);
  if (m[3]) {
    if (hour < 1 || hour > 12) return null;
    hour = (hour % 12) + (m[3].toLowerCase() === "p" ? 12 : 0);
  }
  if (hour > 23 || minute > 59) return null;
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

/** Validates a weekly pattern from a request; returns it cleaned, or an error message. */
export function parseDayTimes(raw: unknown): DayTimes | string {
  if (raw === null || raw === undefined) return {};
  if (typeof raw !== "object" || Array.isArray(raw)) return "Schedule must list days and times.";
  const out: DayTimes = {};
  for (const [day, times] of Object.entries(raw)) {
    if (!WEEK_ORDER.includes(day)) return `Unknown day: ${day}.`;
    if (!Array.isArray(times)) return `Times for ${day} must be a list.`;
    const parsed = times.map((t) => (typeof t === "string" ? parseTime(t) : null));
    if (parsed.some((t) => t === null)) return `Invalid time on ${day}.`;
    if (parsed.length > 0) out[day] = [...new Set(parsed as string[])].sort();
  }
  return out;
}

/** "Nov 7, 8:00 PM" as the clock reads at the theatre, whatever zone the viewer is in. */
export function formatTheatreTime(value: Date | string, withYear = false): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: THEATRE_TZ,
    month: "short",
    day: "numeric",
    year: withYear ? "numeric" : undefined,
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function zoneOffsetMs(at: Date, tz: string): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(at);
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value);
  const asUtc = Date.UTC(
    get("year"),
    get("month") - 1,
    get("day"),
    get("hour"),
    get("minute"),
    get("second")
  );
  return asUtc - at.getTime();
}

/** The instant a wall-clock time on a calendar day happens in `tz`. */
export function zonedTime(dayUtc: number, hour: number, minute: number, tz = THEATRE_TZ): Date {
  const guess = dayUtc + (hour * 60 + minute) * 60_000;
  const offset = zoneOffsetMs(new Date(guess), tz);
  let t = guess - offset;
  // Re-check across a DST boundary.
  const corrected = zoneOffsetMs(new Date(t), tz);
  if (corrected !== offset) t = guess - corrected;
  return new Date(t);
}

/** UTC midnight of the calendar day a stored run date names (stored at UTC midnight or noon). */
function calendarDay(value: Date | string): number {
  const d = new Date(value);
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
}

interface Run {
  startDate: Date | string;
  endDate: Date | string;
}

interface ExpandOptions {
  /** Drop showtimes before this instant. */
  from?: Date;
  cap?: number;
}

/** Expands a run's weekly pattern into showtimes in the theatre's zone. */
export function expandRun(run: Run, dayTimes: DayTimes, opts: ExpandOptions = {}): Date[] {
  const cap = opts.cap ?? 1000;
  const last = calendarDay(run.endDate);
  const out: Date[] = [];

  for (let day = calendarDay(run.startDate); day <= last && out.length < cap; day += DAY_MS) {
    for (const time of dayTimes[WEEKDAYS[new Date(day).getUTCDay()]] ?? []) {
      const [hour, minute] = time.split(":").map(Number);
      if (Number.isNaN(hour) || Number.isNaN(minute)) continue;
      const showtime = zonedTime(day, hour, minute);
      if (opts.from && showtime < opts.from) continue;
      out.push(showtime);
      if (out.length >= cap) break;
    }
  }
  return out;
}

export interface ShowtimeRow {
  startTime: Date | string;
  endTime: Date | string;
  status: "SCHEDULED" | "CANCELED" | "SOLD_OUT";
  label: string | null;
}

export interface RunShowtime {
  start: Date;
  /** Null when only a start is known (pattern or estimate). */
  end: Date | null;
  status: ShowtimeRow["status"];
  label: string | null;
  estimated: boolean;
}

/**
 * Everything a calendar shows for a run, best source first: real performance rows, else the
 * run's weekly pattern, else a typical week flagged as estimated.
 */
export function runShowtimes(
  run: Run & { dayTimes?: unknown; performances?: ShowtimeRow[] }
): RunShowtime[] {
  if (run.performances && run.performances.length > 0) {
    return run.performances
      .map((p) => ({
        start: new Date(p.startTime),
        end: new Date(p.endTime),
        status: p.status,
        label: p.label,
        estimated: false,
      }))
      .sort((a, b) => a.start.getTime() - b.start.getTime());
  }
  const estimated = !hasDayTimes(run.dayTimes);
  return expandRun(run, resolveDayTimes(run.dayTimes)).map((start) => ({
    start,
    end: null,
    status: "SCHEDULED",
    label: null,
    estimated,
  }));
}

/**
 * Today's date at the theatres, as UTC midnight — the same shape as `seenDate` and other
 * calendar-day columns. Plain UTC "today" flips to tomorrow at 5pm in California.
 */
export function theatreToday(now: Date = new Date()): Date {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: THEATRE_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value);
  return new Date(Date.UTC(get("year"), get("month") - 1, get("day")));
}

/**
 * Lower bound for "runs that haven't closed". End dates are calendar days stored in UTC, so
 * comparing against `now` would hide a run on its closing evening in California.
 */
export function openRunCutoff(now: Date = new Date()): Date {
  return new Date(now.getTime() - DAY_MS);
}
