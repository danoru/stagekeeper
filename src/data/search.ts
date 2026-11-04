import { showPath, theatrePath } from "../utils/slug";

import { searchShows, searchTheatres } from "./catalog";
import prisma from "./db";
import { searchPeople } from "./people";

export type SearchKind = "Shows" | "Theatres" | "People" | "Members";

export interface SearchResult {
  key: string;
  kind: SearchKind;
  label: string;
  detail: string | null;
  href: string;
}

const PER_KIND = 5;

/** The navbar's search: shows, theatres, performers and members in one list. */
export async function siteSearch(query: string): Promise<SearchResult[]> {
  const q = query.trim();
  if (q.length < 2) return [];

  const [shows, theatres, people, members] = await Promise.all([
    searchShows(q, PER_KIND),
    searchTheatres(q, PER_KIND),
    searchPeople(q, PER_KIND),
    prisma.users.findMany({
      where: { username: { contains: q, mode: "insensitive" } },
      select: { id: true, username: true },
      orderBy: { username: "asc" },
      take: PER_KIND,
    }),
  ]);

  return [
    ...shows.map(
      (s): SearchResult => ({
        key: `${s.type}-${s.id}`,
        kind: "Shows",
        label: s.title,
        detail: s.type === "MUSICAL" ? "Musical" : "Play",
        href: showPath(s.type === "MUSICAL" ? "musicals" : "plays", s.title),
      })
    ),
    ...theatres.map(
      (t): SearchResult => ({
        key: `theatre-${t.id}`,
        kind: "Theatres",
        label: t.name,
        detail: t.location || null,
        href: theatrePath(t.name),
      })
    ),
    ...people.map(
      (p): SearchResult => ({
        key: `person-${p.id}`,
        kind: "People",
        label: p.name,
        detail: p.latest,
        href: `/people/${p.slug}`,
      })
    ),
    ...members.map(
      (m): SearchResult => ({
        key: `member-${m.id}`,
        kind: "Members",
        label: m.username,
        detail: null,
        href: `/users/${m.username}`,
      })
    ),
  ];
}
