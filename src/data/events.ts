import { EVENT_LIST_TYPE } from "../types";

export const EVENT_LIST: EVENT_LIST_TYPE[] = [
  {
    id: 1,
    title: "Evita",
    playhouse: "The GEM Theatre",
    location: "Garden Grove, CA",
    start: new Date(2024, 7, 21, 19, 30, 0),
    end: new Date(2024, 3, 21, 23, 0, 0),
    attending: true,
  },
];

export const filteredEventList = EVENT_LIST.filter(
  (musical) => musical.attending
);
