import { matchSlug } from "../utils/slug";

import prisma from "./db";

// Card-ready list for /plays; detail pages load the full row themselves.
export async function getPlays() {
  const plays = await prisma.plays.findMany({
    where: { status: "APPROVED" },
    select: { id: true, title: true, playbill: true },
    orderBy: { title: "asc" },
  });
  return plays;
}

export async function getPlayByTitle(slug: string) {
  const titleWithSpaces = slug.replace(/-/g, " ");
  const play = await prisma.plays.findFirst({
    where: {
      title: {
        equals: titleWithSpaces,
        mode: "insensitive",
      },
    },
  });
  if (play) return play;
  // Hyphens, punctuation and accents don't survive the slug, so fall back to a slug match.
  const all = await prisma.plays.findMany({ select: { id: true, title: true } });
  const match = matchSlug(all, slug, (p) => p.title);
  return match ? prisma.plays.findUnique({ where: { id: match.id } }) : null;
}
