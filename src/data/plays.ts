import prisma from "./db";

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
