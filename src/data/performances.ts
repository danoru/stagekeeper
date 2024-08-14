import prisma from "./db";

export const PERFORMANCE_LIST = [
  {
    musical: "Joseph and the Amazing Technicolor Dreamcoat",
    startTime: new Date("2019-09-14"),
    endTime: new Date("2019-09-14"),
    theatre: "Playhouse Merced",
  },
  {
    musical: "Heathers",
    startTime: new Date("2019-11-23"),
    endTime: new Date("2019-11-23"),
    theatre: "OB Playhouse",
  },
  {
    musical: "Frozen",
    startTime: new Date("2020-01-16"),
    endTime: new Date("2020-01-16"),
    theatre: "Pantages Theatre",
  },
  {
    musical: "The Rocky Horror Show",
    startTime: new Date("2020-01-19"),
    endTime: new Date("2020-01-19"),
    theatre: "OB Playhouse",
  },
  {
    musical: "Fun Home",
    startTime: new Date("2020-01-19"),
    endTime: new Date("2020-01-19"),
    theatre: "Patio Playhouse",
  },
  {
    musical: "Kinky Boots",
    startTime: new Date("2020-02-28"),
    endTime: new Date("2020-02-28"),
    theatre: "Cerritos Center for the Performing Arts",
  },
  {
    musical: "Once on this Island",
    startTime: new Date("2021-07-03"),
    endTime: new Date("2021-07-03"),
    theatre: "Moonlight Amphitheatre",
  },
  {
    musical: "Spamalot",
    startTime: new Date("2021-12-04"),
    endTime: new Date("2021-12-04"),
    theatre: "OB Playhouse",
  },
  {
    musical: "A Little Night Music",
    startTime: new Date("2022-03-12"),
    endTime: new Date("2022-03-12"),
    theatre: "Greenway Court Theatre",
  },
  {
    musical: "Annie",
    startTime: new Date("2022-12-09"),
    endTime: new Date("2022-12-09"),
    theatre: "Dolby Theatre",
  },
  {
    musical: "Assassins",
    startTime: new Date("2022-02-27"),
    endTime: new Date("2022-02-27"),
    theatre: "East West Players",
  },
  {
    musical: "Drag the Musical",
    startTime: new Date("2022-10-07"),
    endTime: new Date("2022-10-07"),
    theatre: "The Bourbon Room",
  },
  {
    musical: "Freestyle Love Supreme",
    startTime: new Date("2022-07-20"),
    endTime: new Date("2022-07-20"),
    theatre: "Pasadena Playhouse",
  },
  {
    musical: "Hadestown",
    startTime: new Date("2022-08-14"),
    endTime: new Date("2022-08-14"),
    theatre: "Segerstrom Center for the Arts",
  },
  {
    musical: "In the Heights",
    startTime: new Date("2022-06-17"),
    endTime: new Date("2022-06-17"),
    theatre: "La Mirada Theatre",
  },
  {
    musical: "Moulin Rouge!",
    startTime: new Date("2022-07-31"),
    endTime: new Date("2022-07-31"),
    theatre: "Pantages Theatre",
  },
  {
    musical: "Natasha, Pierre & the Great Comet of 1812",
    startTime: new Date("2022-06-05"),
    endTime: new Date("2022-06-05"),
    theatre: "Capital City Theatre",
  },
  {
    musical: "Once",
    startTime: new Date("2022-04-23"),
    endTime: new Date("2022-04-23"),
    theatre: "California Center for the Arts, Escondido",
  },
  {
    musical: "Rent",
    startTime: new Date("2022-07-16"),
    endTime: new Date("2022-07-16"),
    theatre: "Patio Playhouse",
  },
  {
    musical: "Something Rotten!",
    startTime: new Date("2022-02-12"),
    endTime: new Date("2022-02-12"),
    theatre: "Fred Kavli Theatre",
  },
  {
    musical: "The Book of Mormon",
    startTime: new Date("2022-12-06"),
    endTime: new Date("2022-12-06"),
    theatre: "Pantages Theatre",
  },
  {
    musical: "Wicked",
    startTime: new Date("2022-02-24"),
    endTime: new Date("2022-02-24"),
    theatre: "Segerstrom Center for the Arts",
  },
  {
    musical: "Young Frankenstein",
    startTime: new Date("2022-09-25"),
    endTime: new Date("2022-09-25"),
    theatre: "La Mirada Theatre",
  },
  {
    musical: "Natasha, Pierre & the Great Comet of 1812",
    startTime: new Date("2023-01-13"),
    endTime: new Date("2023-01-13"),
    theatre: "Shotgun Players",
  },
  {
    musical: "Sunday in the Park with George",
    startTime: new Date("2023-02-17"),
    endTime: new Date("2023-02-17"),
    theatre: "Pasadena Playhouse",
  },
  {
    musical: "In the Heights",
    startTime: new Date("2023-03-09"),
    endTime: new Date("2023-03-09"),
    theatre: "Fullerton College Theatre Arts",
  },
  {
    musical: "Hairspray",
    startTime: new Date("2023-04-21"),
    endTime: new Date("2023-04-21"),
    theatre: "Segerstrom Center for the Arts",
  },
  {
    musical: "Chicago",
    startTime: new Date("2023-05-17"),
    endTime: new Date("2023-05-17"),
    theatre: "Segerstrom Center for the Arts",
  },
  {
    musical: "Six",
    startTime: new Date("2023-06-18"),
    endTime: new Date("2023-06-18"),
    theatre: "Segerstrom Center for the Arts",
  },
  {
    musical: "Joseph and the Amazing Technicolor Dreamcoat",
    startTime: new Date("2023-06-24"),
    endTime: new Date("2023-06-24"),
    theatre: "La Mirada Theatre",
  },
  {
    musical: "Into the Woods",
    startTime: new Date("2023-07-29"),
    endTime: new Date("2023-07-29"),
    theatre: "Ahmanson Theatre",
  },
  {
    musical: "Les Misérables",
    startTime: new Date("2023-09-23"),
    endTime: new Date("2023-09-23"),
    theatre: "Segerstrom Center for the Arts",
  },
  {
    musical: "Hadestown",
    startTime: new Date("2023-10-04"),
    endTime: new Date("2023-10-04"),
    theatre: "Ahmanson Theatre",
  },
  {
    musical: "Spring Awakening",
    startTime: new Date("2023-11-17"),
    endTime: new Date("2023-11-17"),
    theatre: "East West Players",
  },
  {
    musical: "Dr. Seuss' How the Grinch Stole Christmas!",
    startTime: new Date("2023-12-10"),
    endTime: new Date("2023-12-10"),
    theatre: "Pantages Theatre",
  },
  {
    musical: "MJ the Musical",
    startTime: new Date("2024-01-11"),
    endTime: new Date("2024-01-11"),
    theatre: "Pantages Theatre",
  },
  {
    musical: "The Lion King",
    startTime: new Date("2024-02-01"),
    endTime: new Date("2024-02-01"),
    theatre: "Segerstrom Center for the Arts",
  },
  {
    musical: "Hedgwig and the Angry Inch",
    startTime: new Date("2024-02-23"),
    endTime: new Date("2024-02-23"),
    theatre: "Chance Theater",
  },
  {
    musical: "9 to 5",
    startTime: new Date("2024-03-23"),
    endTime: new Date("2024-03-23"),
    theatre: "Fullerton College Theatre Arts",
  },
  {
    musical: "Funny Girl",
    startTime: new Date("2024-04-05"),
    endTime: new Date("2024-04-05"),
    theatre: "Ahmanson Theatre",
  },
  {
    musical: "Evil Dead the Musical",
    startTime: new Date("2024-05-10"),
    endTime: new Date("2024-05-10"),
    theatre: "Maverick Theater",
  },
  {
    musical: "The Little Mermaid",
    startTime: new Date("2024-06-20"),
    endTime: new Date("2024-06-20"),
    theatre: "La Mirada Theatre",
  },
  {
    musical: "A Strange Loop",
    startTime: new Date("2024-06-28"),
    endTime: new Date("2024-06-28"),
    theatre: "Ahmanson Theatre",
  },
  {
    musical: "Evita",
    startTime: new Date("2024-06-28"),
    endTime: new Date("2024-06-28"),
    theatre: "Ahmanson Theatre",
  },
];

export async function getPerformances() {
  const performances = await prisma.performances.findMany({
    include: { musicals: true, theatres: true },
    orderBy: {
      startTime: "asc",
    },
  });
  return performances;
}

export async function getFriendsUpcomingPerformances(usernames: string[]) {
  const performances = await prisma.attendance.findMany({
    where: {
      users: {
        username: {
          in: usernames,
        },
      },
      performances: {
        startTime: { gte: new Date() },
      },
    },
    include: {
      performances: {
        include: { musicals: true, plays: true, theatres: true },
      },
    },
  });

  return performances;
}

export async function getRecentPerformances(usernames: string[]) {
  const performances = await prisma.attendance.findMany({
    where: {
      users: {
        username: {
          in: usernames,
        },
      },
      performances: {
        startTime: { lte: new Date() },
      },
    },
    include: {
      performances: {
        include: { musicals: true, plays: true, theatres: true },
      },
    },
    orderBy: {
      performances: {
        startTime: "desc",
      },
    },
  });

  return performances;
}

export async function getUserAttendance(id: number) {
  const attendance = await prisma.attendance.findMany({
    where: { user: id },
    orderBy: { performances: { musicals: { title: "asc" } } },
    include: {
      performances: {
        include: { musicals: true, plays: true, theatres: true },
      },
    },
  });
  return attendance;
}

export async function getUserAttendanceById(user: number, musical: number) {
  const attendance = await prisma.attendance.findFirst({
    where: {
      user,
      performances: {
        musical,
      },
    },

    include: {
      performances: {
        include: {
          musicals: true,
          theatres: true,
        },
      },
    },
  });
  return attendance;
}

export async function getUserAttendanceByYear(year: number | null, id: number) {
  let dateFilter = {};

  if (year) {
    const startOfYear = new Date(year, 0, 1);
    const endOfYear = new Date(year + 1, 0, 1);
    dateFilter = {
      startTime: {
        gte: startOfYear,
        lt: endOfYear,
      },
    };
  }

  const attendance = await prisma.attendance.findMany({
    where: {
      user: id,

      performances: dateFilter,
    },
    orderBy: { performances: { startTime: "asc" } },
    include: {
      performances: { include: { musicals: true, theatres: true } },
    },
  });
  return attendance;
}
