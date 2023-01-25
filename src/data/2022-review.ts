import { MUSICAL_LIST_TYPE } from "../types";

const MUSICAL_LIST: MUSICAL_LIST_TYPE[] = [
  {
    title: "A Little Night Music",
    premiere: "1973-02-25",
    genre: "Comedy",
    date: "2022-03-12",
    location: "Los Angeles, CA",
    playhouse: "Greenway Court Theatre",
    image: "",
    duration: 0,
    groupAttended: false,
  },
  {
    title: "Annie",
    premiere: "1977-04-21",
    genre: "Comedy",
    date: "2022-12-09",
    location: "Los Angeles, CA",
    playhouse: "Dolby Theatre",
    image: "",
    duration: 0,
    groupAttended: false,
  },
  {
    title: "Assassins",
    premiere: "2004-04-22",
    genre: "Drama",
    date: "2022-02-27",
    location: "Los Angeles, CA",
    playhouse: "East West Players",
    image: "images/playbills/assassins.jpg",
    duration: 110,
    groupAttended: true,
  },
  {
    title: "Drag the Musical",
    premiere: "2022-09-23",
    genre: "Comedy",
    date: "2022-10-07",
    location: "Los Angeles, CA",
    playhouse: "The Bourbon Room",
    image: "",
    duration: 0,
    groupAttended: false,
  },
  {
    title: "Freestyle Love Supreme",
    premiere: "2019-10-02",
    genre: "Comedy",
    date: "2022-07-20",
    location: "Pasadena, CA",
    playhouse: "Pasadena Playhouse",
    image: "",
    duration: 0,
    groupAttended: false,
  },
  {
    title: "Hadestown",
    premiere: "2019-04-17",
    genre: "Drama",
    date: "2022-08-14",
    location: "Costa Mesa, CA",
    playhouse: "Segerstrom Center for the Arts",
    image: "images/playbills/hadestown.jpg",
    duration: 150,
    groupAttended: true,
  },
  {
    title: "In the Heights",
    premiere: "2008-02-14",
    genre: "Drama",
    date: "2022-06-17",
    location: "La Mirada, CA",
    playhouse: "La Mirada Theatre",
    image: "images/playbills/intheheights.jpg",
    duration: 155,
    groupAttended: true,
  },
  {
    title: "Moulin Rouge!",
    premiere: "2019-07-25",
    genre: "Drama",
    date: "2022-07-31",
    location: "Los Angeles, CA",
    playhouse: "Pantages Theatre",
    image: "images/playbills/moulinrouge.jpg",
    duration: 155,
    groupAttended: true,
  },
  {
    title: "Natasha, Pierre & the Great Comet of 1812",
    premiere: "2016-11-14",
    genre: "Drama",
    date: "2022-06-05",
    location: "Madison, WS",
    playhouse: "Capital City Theatre",
    image: "",
    duration: 0,
    groupAttended: false,
  },
  {
    title: "Once",
    premiere: "2012-03-18",
    genre: "Drama",
    date: "2022-04-23",
    location: "Escondido, CA",
    playhouse: "California Center for the Arts, Escondido",
    image: "images/playbills/once.jpg",
    duration: 150,
    groupAttended: true,
  },
  {
    title: "Rent",
    premiere: "1996-04-29",
    genre: "Drama",
    date: "2022-07-16",
    location: "Escondido, CA",
    playhouse: "Patio Playhouse",
    image: "images/playbills/rent.jpg",
    duration: 150,
    groupAttended: true,
  },
  {
    title: "Something Rotten!",
    premiere: "2015-04-22",
    genre: "Comedy",
    date: "2022-02-12",
    location: "Thousand Oaks, CA",
    playhouse: "Fred Kavli Theatre",
    image: "images/playbills/somethingrotten.jpg",
    duration: 155,
    groupAttended: true,
  },
  {
    title: "The Book of Mormon",
    premiere: "2011-03-24",
    genre: "Comedy",
    date: "2022-12-06",
    location: "Los Angeles, CA",
    playhouse: "Pantages Theatre",
    image: "",
    duration: 0,
    groupAttended: false,
  },
  {
    title: "Wicked",
    premiere: "2003-06-10",
    genre: "Drama",
    date: "2022-02-24",
    location: "Costa Mesa, CA",
    playhouse: "Segerstrom Center for the Arts",
    image: "images/playbills/wicked.jpg",
    duration: 165,
    groupAttended: true,
  },
  {
    title: "Young Frankenstein",
    premiere: "2007-11-08",
    genre: "Comedy",
    date: "2022-09-25",
    location: "La Mirada, CA",
    playhouse: "La Mirada Theatre",
    image: "images/playbills/youngfrankenstein.jpg",
    duration: 140,
    groupAttended: true,
  },
];

export function getFeaturedMusicals() {
  return MUSICAL_LIST.filter((musical) => musical.groupAttended);
}

export function getAllMusicals() {
  return MUSICAL_LIST;
}

export function getFilteredMusicals(dateFilter: any) {
  const { year, month } = dateFilter;

  let filteredMusicals = MUSICAL_LIST.filter((musical) => {
    const musicalDate = new Date(musical.date);
    return (
      musicalDate.getFullYear() === year && musicalDate.getMonth() === month - 1
    );
  });

  return filteredMusicals;
}
