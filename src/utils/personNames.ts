// Name comparison for "same person?" suggestions. Pure, so it can be checked on its own.

/** Lower case, accents and punctuation dropped, spaces collapsed: "Zoë O'Neil" → "zoe oneil". */
export function normalizePersonName(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9 ]+/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** Levenshtein distance, stopping early once it passes `max`. */
export function editDistance(a: string, b: string, max = 3): number {
  if (Math.abs(a.length - b.length) > max) return max + 1;
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const row = [i];
    let best = i;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      row[j] = Math.min(prev[j] + 1, row[j - 1] + 1, prev[j - 1] + cost);
      best = Math.min(best, row[j]);
    }
    if (best > max) return max + 1;
    prev = row;
  }
  return prev[b.length];
}

/**
 * Normalised names close enough to be a typo: one letter apart, or two for longer names.
 * Short names get no slack ("Ana Li" and "Ann Li" are different people).
 */
export function closeNames(a: string, b: string): boolean {
  if (a === b) return true;
  const len = Math.min(a.length, b.length);
  if (len < 8) return false;
  return editDistance(a, b, 2) <= (len >= 14 ? 2 : 1);
}
