import prisma from "./db";

// Card-ready list for /plays; detail pages load the full row themselves.
export async function getPlays() {
  const plays = await prisma.plays.findMany({
    select: { id: true, title: true, playbill: true },
    orderBy: { title: "asc" },
  });
  return plays;
}

export async function getPlayByTitle(playTitle: string) {
  const titleWithSpaces = playTitle.replace(/-/g, " ");
  const play = await prisma.plays.findFirst({
    where: {
      title: {
        equals: titleWithSpaces,
        mode: "insensitive",
      },
    },
  });
  return play;
}

export async function getPaginatedPlays(page: number, limit: number) {
  const skip = (page - 1) * limit;
  const plays = await prisma.plays.findMany({
    orderBy: {
      title: "asc",
    },
    skip,
    take: limit,
  });
  const playCount = await prisma.plays.count();
  return { plays, playCount };
}
