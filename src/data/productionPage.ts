import type { GetServerSidePropsContext } from "next";
import superjson from "superjson";

import { productionSlugs } from "../utils/productionSlug";
import { showPath, type ShowSegment } from "../utils/slug";
import { getViewer } from "../utils/viewer";

import { getMusicalByTitle } from "./musicals";
import { getShowProductions } from "./people";
import { getPlayByTitle } from "./plays";
import { canViewPending } from "./visibility";

/** Server props for /musicals/<show>/<production> and /plays/<show>/<production>. */
export async function getProductionPageProps(
  segment: ShowSegment,
  context: GetServerSidePropsContext
) {
  const titleSlug = String(context.params?.title ?? "");
  const productionSlug = String(context.params?.production ?? "");
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
  const slugs = productionSlugs(
    productions.map(({ production }) => ({
      id: production.id,
      startDate: production.startDate,
      theatreName: production.seasons?.theatres.name ?? null,
    }))
  );
  const item = productions.find(({ production }) => slugs.get(production.id) === productionSlug);
  if (!item) return { notFound: true as const };

  return {
    props: superjson.serialize({
      segment,
      show: { id: show.id, title: show.title, playbill: show.playbill },
      item,
      path: `${showPath(segment, show.title)}/${productionSlug}`,
      otherCount: productions.length - 1,
    }).json,
  };
}
