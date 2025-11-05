import prisma from "./db";

export const THEATRES_LIST = [
  {
    location: "Merced, CA",
    name: "Playhouse Merced",
    image: "https://picsum.photos/649/1024",
  },
  {
    location: "Ocean Beach, CA",
    name: "OB Playhouse",
    image: "https://picsum.photos/649/1024",
  },
  {
    location: "Los Angeles, CA",
    name: "Pantages Theatre",
    image: "https://picsum.photos/649/1024",
  },
  {
    location: "Escondido, CA",
    name: "Patio Playhouse",
    image: "https://picsum.photos/649/1024",
  },
  {
    location: "Cerritos, CA",
    name: "Cerritos Center for the Performing Arts",
    image: "https://picsum.photos/649/1024",
  },
  {
    location: "Vista, CA",
    name: "Moonlight Amphitheatre",
    image: "https://picsum.photos/649/1024",
  },
  {
    location: "Los Angeles, CA",
    name: "Greenway Court Theatre",
    image: "https://picsum.photos/649/1024",
  },
  {
    location: "Los Angeles, CA",
    name: "Dolby Theatre",
    image: "https://picsum.photos/649/1024",
  },
  {
    location: "Los Angeles, CA",
    name: "East West Players",
    image: "https://picsum.photos/649/1024",
  },
  {
    location: "Los Angeles, CA",
    name: "The Bourbon Room",
    image: "https://picsum.photos/649/1024",
  },
  {
    location: "Pasadena, CA",
    name: "Pasadena Playhouse",
    image: "https://picsum.photos/649/1024",
  },
  {
    location: "Costa Mesa, CA",
    name: "Segerstrom Center for the Arts",
    image: "https://picsum.photos/649/1024",
  },
  {
    location: "La Mirada, CA",
    name: "La Mirada Theatre",
    image: "https://picsum.photos/649/1024",
  },
  {
    location: "Madison, WS",
    name: "Capital City Theatre",
    image: "https://picsum.photos/649/1024",
  },
  {
    location: "Escondido, CA",
    name: "California Center for the Arts, Escondido",
    image: "https://picsum.photos/649/1024",
  },
  {
    location: "Thousand Oaks, CA",
    name: "Fred Kavli Theatre",
    image: "https://picsum.photos/649/1024",
  },
  {
    location: "Berkeley, CA",
    name: "Shotgun Players",
    image: "https://picsum.photos/649/1024",
  },
  {
    location: "Fullerton, CA",
    name: "Fullerton College Theatre Arts",
    image: "https://picsum.photos/649/1024",
  },
  {
    location: "Los Angeles, CA",
    name: "Ahmanson Theatre",
    image: "https://picsum.photos/649/1024",
  },
  {
    location: "Anaheim, CA",
    name: "Chance Theater",
    image: "https://picsum.photos/649/1024",
  },
  {
    location: "Fullerton, CA",
    name: "Maverick Theater",
    image: "https://picsum.photos/649/1024",
  },
  {
    location: "Garden Grove, CA",
    name: "The GEM Theatre",
    image: "https://picsum.photos/649/1024",
  },
];

export async function getTheatres() {
  const theatres = await prisma.theatres.findMany({
    orderBy: {
      name: "asc",
    },
  });
  return theatres;
}

export async function getPaginatedTheatres(page: number, limit: number) {
  const skip = (page - 1) * limit;
  const theatres = await prisma.theatres.findMany({
    orderBy: {
      name: "asc",
    },
    skip,
    take: limit,
  });
  const theatreCount = await prisma.theatres.count();
  return { theatres, theatreCount };
}

export async function getTheatreByName(theatreName: string) {
  const formattedName = theatreName.replace(/\s+/g, "-").toLowerCase();
  const theatres = await prisma.theatres.findMany({
    select: {
      name: true,
    },
  });

  const matchedTheatre = theatres.find(
    (theatre) => theatre.name.replace(/\s+/g, "-").toLowerCase() === formattedName
  );

  if (matchedTheatre) {
    const theatre = await prisma.theatres.findFirst({
      where: {
        name: matchedTheatre.name,
      },
    });
    return theatre;
  }
  return null;
}

export async function getCurrentSeason(theatreId: number) {
  const seasons = await prisma.seasons.findMany({
    where: {
      theatre: theatreId,
    },
    include: {
      programming: {
        include: {
          musicals: true,
          plays: true,
        },
      },
    },
    orderBy: {
      startDate: "desc",
    },
    take: 1,
  });

  const sortedSeasons = seasons.map((season) => ({
    ...season,
    programming: season.programming.sort((a, b) => {
      if (a.startDate && b.startDate) {
        return a.startDate.getTime() - b.startDate.getTime();
      }
      return 0;
    }),
  }));

  return sortedSeasons;
}
