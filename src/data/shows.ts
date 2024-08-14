import prisma from "./db";

export async function getUpcomingPerformances() {
  const upcomingLimit = new Date();
  upcomingLimit.setMonth(upcomingLimit.getMonth() + 6);

  const programming = await prisma.programming.findMany({
    where: {
      startDate: {
        gte: new Date(),
        lte: upcomingLimit,
      },
      endDate: {
        gte: new Date(),
      },
    },
    include: {
      musicals: true,
      plays: true,
      seasons: {
        include: {
          theatres: true,
        },
      },
    },
    orderBy: {
      startDate: "asc",
    },
  });

  return programming;
}

export async function getWatchlist(id: number) {
  const watchlist = await prisma.watchlist.findMany({
    where: {
      user: id,
    },
    include: {
      musicals: true,
      plays: true,
    },
  });
  const combined = watchlist.flatMap((item) => {
    const musicalsEntry = item.musicals
      ? { type: "musical", title: item.musicals.title, item }
      : [];
    const playsEntry = item.plays
      ? { type: "play", title: item.plays.title, item }
      : [];
    return [musicalsEntry, playsEntry].flat();
  });

  const sortedCombined = combined
    .filter((entry) => entry.title !== undefined)
    .sort((a, b) => a.title.localeCompare(b.title))
    .map((entry) => entry.item);

  return sortedCombined;
}
