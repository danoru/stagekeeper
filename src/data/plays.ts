import prisma from "./db";

export async function getPlayByTitle(playTitle: string) {
  const formattedTitle = playTitle.replace(/\s+/g, "-").toLowerCase();
  const plays = await prisma.plays.findMany({
    select: {
      title: true,
    },
  });

  const matchedPlay = plays.find(
    (play) => play.title.replace(/\s+/g, "-").toLowerCase() === formattedTitle
  );

  if (matchedPlay) {
    const play = await prisma.plays.findFirst({
      where: {
        title: matchedPlay.title,
      },
    });
    return play;
  }
  return null;
}

export async function getLikedPlays(id: number) {
  const likedPlays = await prisma.likedShows.findMany({
    where: {
      user: id,
    },
    include: {
      plays: true,
    },
    orderBy: {
      plays: { title: "asc" },
    },
  });
  return likedPlays;
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

export async function getUserPlayAttendance(id: number) {
  const attendance = await prisma.attendance.findMany({
    where: { NOT: { performances: { play: null } }, user: id },
    orderBy: { performances: { plays: { title: "asc" } } },
    include: {
      performances: {
        include: { plays: true, theatres: true },
      },
    },
  });
  return attendance;
}

export async function getUpcomingPlays() {
  const upcomingLimit = new Date();
  upcomingLimit.setMonth(upcomingLimit.getMonth() + 6);

  const programming = await prisma.programming.findMany({
    where: {
      NOT: {
        play: null,
      },
      startDate: {
        gte: new Date(),
        lte: upcomingLimit,
      },
      endDate: {
        gte: new Date(),
      },
    },
    include: {
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
      plays: true,
    },
    orderBy: {
      plays: { title: "asc" },
    },
  });
  return watchlist;
}
