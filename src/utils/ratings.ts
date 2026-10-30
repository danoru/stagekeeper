// Ratings are stored per visit. A person's rating for a show is the mean of their rated
// visits; the community rating averages people, not visits, so repeat visitors count once.

export function mean(values: number[]): number | null {
  if (values.length === 0) return null;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

/** 4.75 → "4.75", 4.5 → "4.5", 4 → "4". */
export function formatRating(value: number): string {
  return String(Number(value.toFixed(2)));
}
