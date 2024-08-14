import prisma from "./db";

export const MUSICALS_LIST = [
  {
    title: "Joseph and the Amazing Technicolor Dreamcoat",
    premiere: new Date("1982-01-27"),
    playbill: "/images/playbills/joseph.jpg",
    bookBy: "Tim Rice",
    musicBy: "Andrew Lloyd Webber",
    lyricsBy: "Tim Rice",
    duration: 120,
  },
  {
    title: "Heathers",
    premiere: new Date("2014-03-31"),
    playbill: "/images/playbills/heathers.jpg",
    bookBy: "",
    musicBy: "",
    lyricsBy: "",
    duration: 150,
  },
  {
    title: "Frozen",
    premiere: new Date("2018-03-22"),
    playbill: "/images/playbills/frozen.jpg",
    bookBy: "",
    musicBy: "",
    lyricsBy: "",
    duration: 140,
  },
  {
    title: "The Rocky Horror Show",
    premiere: new Date("1975-03-10"),
    playbill: "/images/playbills/rockyhorror.jpg",
    bookBy: "",
    musicBy: "",
    lyricsBy: "",
    duration: 120,
  },
  {
    title: "Fun Home",
    premiere: new Date("2015-04-19"),
    playbill: "/images/playbills/funhome.jpg",
    bookBy: "",
    musicBy: "",
    lyricsBy: "",
    duration: 95,
  },
  {
    title: "Kinky Boots",
    premiere: new Date("2013-04-04"),
    playbill: "/images/playbills/kinkyboots.jpg",
    bookBy: "",
    musicBy: "",
    lyricsBy: "",
    duration: 135,
  },
  {
    title: "Once on this Island",
    premiere: new Date("1990-10-18"),
    playbill: "/images/playbills/onceonthisisland.jpg",
    bookBy: "",
    musicBy: "",
    lyricsBy: "",
    duration: 100,
  },
  {
    title: "Spamalot",
    premiere: new Date("2005-03-17"),
    playbill: "/images/playbills/spamalot.jpg",
    bookBy: "",
    musicBy: "",
    lyricsBy: "",
    duration: 135,
  },
  {
    title: "A Little Night Music",
    premiere: new Date("1973-02-25"),
    playbill: "/images/playbills/alittlenightmusic.jpg",
    bookBy: "Hugh Wheeler",
    musicBy: "Stephen Sondheim",
    lyricsBy: "Stephen Sondheim",
    duration: 150,
  },
  {
    title: "Annie",
    premiere: new Date("1977-04-21"),
    playbill: "/images/playbills/annie.jpg",
    bookBy: "",
    musicBy: "",
    lyricsBy: "",
    duration: 150,
  },
  {
    title: "Assassins",
    premiere: new Date("2004-04-22"),
    playbill: "/images/playbills/assassins.jpg",
    bookBy: "John Weidman",
    musicBy: "Stephen Sondheim",
    lyricsBy: "Stephen Sondheim",
    duration: 110,
  },
  {
    title: "Drag the Musical",
    premiere: new Date("2022-09-23"),
    playbill: "/images/playbills/drag.jpg",
    bookBy: "",
    musicBy: "",
    lyricsBy: "",
    duration: 100,
  },
  {
    title: "Freestyle Love Supreme",
    premiere: new Date("2019-10-2"),
    playbill: "/images/playbills/freestylelovesupreme.jpg",
    bookBy: "",
    musicBy: "",
    lyricsBy: "",
    duration: 90,
  },
  {
    title: "Moulin Rouge!",
    premiere: new Date("2019-07-25"),
    playbill: "/images/playbills/moulinrouge.jpg",
    bookBy: "",
    musicBy: "",
    lyricsBy: "",
    duration: 155,
  },
  {
    title: "Natasha, Pierre & the Great Comet of 1812",
    premiere: new Date("2016-11-14"),
    playbill: "/images/playbills/greatcomet.jpg",
    bookBy: "Dave Malloy",
    musicBy: "Dave Malloy",
    lyricsBy: "Dave Malloy",
    duration: 120,
  },
  {
    title: "Once",
    premiere: new Date("2012-03-18"),
    playbill: "/images/playbills/once.jpg",
    bookBy: "",
    musicBy: "",
    lyricsBy: "",
    duration: 150,
  },
  {
    title: "Rent",
    premiere: new Date("1996-04-29"),
    playbill: "/images/playbills/rent.jpg",
    bookBy: "Jonathan Larson",
    musicBy: "Jonathan Larson",
    lyricsBy: "Jonathan Larson",
    duration: 150,
  },
  {
    title: "Something Rotten!",
    premiere: new Date("2015-04-22"),
    playbill: "/images/playbills/somethingrotten.jpg",
    bookBy: "",
    musicBy: "",
    lyricsBy: "",
    duration: 155,
  },
  {
    title: "The Book of Mormon",
    premiere: new Date("2011-03-24"),
    playbill: "/images/playbills/thebookofmormon.jpg",
    bookBy: "",
    musicBy: "",
    lyricsBy: "",
    duration: 155,
  },
  {
    title: "Wicked",
    premiere: new Date("2003-06-10"),
    playbill: "/images/playbills/wicked.jpg",
    bookBy: "",
    musicBy: "",
    lyricsBy: "",
    duration: 165,
  },
  {
    title: "Young Frankenstein",
    premiere: new Date("2007-11-8"),
    playbill: "/images/playbills/youngfrankenstein.jpg",
    bookBy: "",
    musicBy: "",
    lyricsBy: "",
    duration: 140,
  },
  {
    title: "Sunday in the Park with George",
    premiere: new Date("1984-05-02"),
    playbill: "/images/playbills/sundayintheparkwithgeorge.jpg",
    bookBy: "James Lapine",
    musicBy: "Stephen Sondheim",
    lyricsBy: "Stephen Sondheim",
    duration: 155,
  },
  {
    title: "In the Heights",
    premiere: new Date("2008-02-14"),
    playbill: "/images/playbills/intheheights.jpg",
    bookBy: "Quiara Alegría Hudes",
    musicBy: "Lin-Manuel Miranda",
    lyricsBy: "Lin-Manuel Miranda",
    duration: 155,
  },
  {
    title: "Hairspray",
    premiere: new Date("2007-07-20"),
    playbill: "/images/playbills/hairspray.jpg",
    bookBy: "",
    musicBy: "",
    lyricsBy: "",
    duration: 150,
  },
  {
    title: "Chicago",
    premiere: new Date("1975-06-03"),
    playbill: "/images/playbills/chicago.jpg",
    bookBy: "",
    musicBy: "",
    lyricsBy: "",
    duration: 150,
  },
  {
    title: "Six",
    premiere: new Date("2021-10-03"),
    playbill: "https://picsum.photos/649/1024",
    bookBy: "",
    musicBy: "",
    lyricsBy: "",
    duration: 80,
  },
  {
    title: "Into the Woods",
    premiere: new Date("1986-12-04"),
    playbill: "https://picsum.photos/649/1024",
    bookBy: "James Lapine",
    musicBy: "Stephen Sondheim",
    lyricsBy: "Stephen Sondheim",
    duration: 165,
  },
  {
    title: "Les Misérables",
    premiere: new Date("1986-12-27"),
    playbill: "https://picsum.photos/649/1024",
    bookBy: "",
    musicBy: "",
    lyricsBy: "",
    duration: 178,
  },
  {
    title: "Hadestown",
    premiere: new Date("2019-04-17"),
    playbill: "/images/playbills/hadestown.jpg",
    bookBy: "Anaïs Mitchell",
    musicBy: "Anaïs Mitchell",
    lyricsBy: "Anaïs Mitchell",
    duration: 150,
  },
  {
    title: "Spring Awakening",
    premiere: new Date("2006-12-10"),
    playbill: "https://picsum.photos/649/1024",
    bookBy: "",
    musicBy: "",
    lyricsBy: "",
    duration: 100,
  },
  {
    title: "Dr. Seuss' How the Grinch Stole Christmas!",
    premiere: new Date("2006-11-08"),
    playbill: "https://picsum.photos/649/1024",
    bookBy: "",
    musicBy: "",
    lyricsBy: "",
    duration: 85,
  },
  {
    title: "MJ the Musical",
    premiere: new Date("2022-02-01"),
    playbill: "https://picsum.photos/649/1024",
    bookBy: "",
    musicBy: "",
    lyricsBy: "",
    duration: 150,
  },
  {
    title: "The Lion King",
    premiere: new Date("1997-11-13"),
    playbill: "https://picsum.photos/649/1024",
    bookBy: "",
    musicBy: "",
    lyricsBy: "",
    duration: 150,
  },
  {
    title: "Hedgwig and the Angry Inch",
    premiere: new Date("1998-02-14"),
    playbill: "https://picsum.photos/649/1024",
    bookBy: "",
    musicBy: "",
    lyricsBy: "",
    duration: 90,
  },
  {
    title: "9 to 5",
    premiere: new Date("2009-04-07"),
    playbill: "https://picsum.photos/649/1024",
    bookBy: "",
    musicBy: "",
    lyricsBy: "",
    duration: 150,
  },
  {
    title: "Funny Girl",
    premiere: new Date("1964-03-26"),
    playbill: "https://picsum.photos/649/1024",
    bookBy: "",
    musicBy: "",
    lyricsBy: "",
    duration: 160,
  },
  {
    title: "Evil Dead the Musical",
    premiere: new Date("2006-10-02"),
    playbill: "https://picsum.photos/649/1024",
    bookBy: "George Reinblatt",
    musicBy: "",
    lyricsBy: "",
    duration: 155,
  },
  {
    title: "The Little Mermaid",
    premiere: new Date("2007-11-03"),
    playbill: "https://picsum.photos/649/1024",
    bookBy: "Doug Wright",
    musicBy: "Alan Menken",
    lyricsBy: "Howard Ashman & Glenn Slater",
    duration: 155,
  },
  {
    title: "A Strange Loop",
    premiere: new Date("2023-01-15"),
    playbill: "https://picsum.photos/649/1024",
    bookBy: "",
    musicBy: "",
    lyricsBy: "",
    duration: 100,
  },
  {
    title: "Once Upon a Mattress",
    premiere: new Date("1959-05-11"),
    playbill: "https://picsum.photos/649/1024",
    bookBy: "Amy Sherman-Palladino",
    musicBy: "Mary Rodgers",
    lyricsBy: "Marshall Barer",
    duration: 135,
  },
  {
    title: "Stephen Sondheim's Old Friends",
    premiere: new Date("2022-05-03"),
    playbill: "https://picsum.photos/649/1024",
    bookBy: "None",
    musicBy: "Stephen Sondheim",
    lyricsBy: "Stephen Sondheim",
    duration: 150,
  },
  {
    title: "Parade",
    premiere: new Date("1998-12-17"),
    playbill: "https://picsum.photos/649/1024",
    bookBy: "Alfred Uhry",
    musicBy: "Jason Robert Brown",
    lyricsBy: "Jason Robert Brown",
    duration: 150,
  },
  {
    title: "Clue",
    premiere: new Date("1997-12-03"),
    playbill: "https://picsum.photos/649/1024",
    bookBy: "",
    musicBy: "",
    lyricsBy: "",
    duration: 80,
  },
  {
    title: "Company",
    premiere: new Date("1970-03-24"),
    playbill: "https://picsum.photos/649/1024",
    bookBy: "George Furth",
    musicBy: "Stephen Sondheim",
    lyricsBy: "Stephen Sondheim",
    duration: 165,
  },
];

export async function getMusicals() {
  const musicals = await prisma.musicals.findMany({
    orderBy: {
      title: "asc",
    },
  });
  return musicals;
}

export async function getPaginatedMusicals(page: number, limit: number) {
  const skip = (page - 1) * limit;
  const musicals = await prisma.musicals.findMany({
    orderBy: {
      title: "asc",
    },
    skip,
    take: limit,
  });
  const musicalCount = await prisma.musicals.count();
  return { musicals, musicalCount };
}

export async function getMusicalByTitle(musicalTitle: string) {
  const formattedTitle = musicalTitle.replace(/\s+/g, "-").toLowerCase();
  const musicals = await prisma.musicals.findMany({
    select: {
      title: true,
    },
  });

  const matchedMusical = musicals.find(
    (musical) =>
      musical.title.replace(/\s+/g, "-").toLowerCase() === formattedTitle
  );

  if (matchedMusical) {
    const musical = await prisma.musicals.findFirst({
      where: {
        title: matchedMusical.title,
      },
    });
    return musical;
  }
  return null;
}

export async function getLikedMusicals(id: number) {
  const likedMusicals = await prisma.likedShows.findMany({
    where: {
      user: id,
    },
    include: {
      musicals: true,
    },
    orderBy: {
      musicals: { title: "asc" },
    },
  });
  return likedMusicals;
}

export async function getWatchlist(id: number) {
  const watchlist = await prisma.watchlist.findMany({
    where: {
      user: id,
    },
    include: {
      musicals: true,
    },
    orderBy: {
      musicals: { title: "asc" },
    },
  });
  return watchlist;
}
