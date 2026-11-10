import type { GetServerSidePropsContext } from "next";
import superjson from "superjson";

import { showPath, slugify, type ShowSegment } from "../utils/slug";
import { getViewer } from "../utils/viewer";

import { getMusicalByTitle } from "./musicals";
import { getShowProductions } from "./people";
import { getPlayByTitle } from "./plays";
import { canViewPending } from "./visibility";

export interface RoleProduction {
  id: number;
  startDate: Date;
  endDate: Date;
  theatre: { id: number; name: string } | null;
  actors: { name: string; slug: string }[];
}

/** Server props for /musicals/<show>/roles/<character> (and plays). Characters match as typed. */
export async function getRolePageProps(segment: ShowSegment, context: GetServerSidePropsContext) {
  const titleSlug = String(context.params?.title ?? "");
  const characterSlug = String(context.params?.character ?? "");
  const show =
    segment === "musicals" ? await getMusicalByTitle(titleSlug) : await getPlayByTitle(titleSlug);
  if (!show) return { notFound: true as const };
  const ref = segment === "musicals" ? { musical: show.id } : { play: show.id };
  if (show.status === "PENDING") {
    const viewer = await getViewer(context);
    if (!(await canViewPending(ref, show.createdBy, viewer))) return { notFound: true as const };
    context.res.setHeader("Cache-Control", "private, no-store");
  } else {
    context.res.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=600");
  }

  const productions = await getShowProductions(ref);
  let character: string | null = null;
  const rows: RoleProduction[] = [];
  for (const { production, credits } of productions) {
    const actors = credits.filter(
      (c) => c.category === "CAST" && c.character && slugify(c.character) === characterSlug
    );
    if (actors.length === 0) continue;
    character ??= actors[0].character;
    rows.push({
      id: production.id,
      startDate: production.startDate,
      endDate: production.endDate,
      theatre: production.seasons?.theatres
        ? { id: production.seasons.theatres.id, name: production.seasons.theatres.name }
        : null,
      actors: actors.map((a) => a.person),
    });
  }
  // A role page is only interesting with two productions to compare.
  if (!character || rows.length < 2) return { notFound: true as const };

  return {
    props: superjson.serialize({
      segment,
      show: { id: show.id, title: show.title },
      character,
      productions: rows,
      path: `${showPath(segment, show.title)}/roles/${characterSlug}`,
    }).json,
  };
}
