// URL slugs for shows and theatres. Titles can contain hyphens, "?", "&", "#" and accents,
// so slugs are lossy and lookups match on slugify(title) rather than reversing the slug.

export function slugify(name: string): string {
  return name
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export type ShowSegment = "musicals" | "plays";

export function showPath(segment: ShowSegment, title: string): string {
  return `/${segment}/${slugify(title)}`;
}

export function theatrePath(name: string): string {
  return `/theatres/${slugify(name)}`;
}

/** Picks the row whose name slugifies to `slug`; also accepts the old "spaces-to-hyphens" URLs. */
export function matchSlug<T>(rows: T[], slug: string, nameOf: (row: T) => string): T | undefined {
  const target = slugify(slug);
  if (!target) return undefined;
  return rows.find((row) => slugify(nameOf(row)) === target);
}
