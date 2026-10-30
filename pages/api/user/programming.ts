import moment from "moment-timezone";
import { NextApiRequest, NextApiResponse } from "next";

import prisma from "../../../src/data/db";
import { openRunCutoff, THEATRE_TZ } from "../../../src/utils/schedule";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { userId } = req.query;

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed." });
  }

  const user = Number(userId);
  if (typeof userId !== "string" || !Number.isInteger(user)) {
    return res.status(400).json({ error: "User ID is required." });
  }

  const cutoff = openRunCutoff();

  try {
    const watchlist = await prisma.watchlist.findMany({
      where: {
        user,
        OR: [
          {
            musicals: {
              programming: {
                some: {
                  endDate: { gte: cutoff },
                },
              },
            },
          },
          {
            plays: {
              programming: {
                some: {
                  endDate: { gte: cutoff },
                },
              },
            },
          },
        ],
      },
      select: {
        musicals: {
          include: {
            programming: {
              include: {
                musicals: { select: { title: true, duration: true } },
                plays: { select: { title: true, duration: true } },
                seasons: { include: { theatres: { select: { name: true } } } },
              },
            },
          },
        },
        plays: {
          include: {
            programming: {
              include: {
                musicals: { select: { title: true, duration: true } },
                plays: { select: { title: true, duration: true } },
                seasons: { include: { theatres: { select: { name: true } } } },
              },
            },
          },
        },
      },
    });

    const watchlistPerformances = watchlist.flatMap((watchItem) => {
      return [
        ...(watchItem.musicals?.programming
          .filter((program) => program.endDate && program.endDate >= cutoff)
          .map((program) => ({
            id: program.id,
            title: program.musicals?.title,
            duration: program.musicals?.duration,
            theatre: program.seasons?.theatres.name,
            startDate: program.startDate,
            endDate: program.endDate,
            dayTimes: program.dayTimes,
            source: "watchlist",
          })) || []),
        ...(watchItem.plays?.programming
          .filter((program) => program.endDate && program.endDate >= cutoff)
          .map((program) => ({
            id: program.id,
            title: program.plays?.title,
            duration: program.plays?.duration,
            theatre: program.seasons?.theatres.name,
            startDate: program.startDate,
            endDate: program.endDate,
            dayTimes: program.dayTimes,
            source: "watchlist",
          })) || []),
      ];
    });

    const date = new Date();
    const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);

    const attendancePerformances = await prisma.attendance.findMany({
      where: {
        user,
        performances: { startTime: { gte: firstDayOfMonth } },
      },
      select: {
        performances: {
          include: {
            musicals: { select: { title: true, duration: true } },
            plays: { select: { title: true, duration: true } },
            theatres: { select: { name: true } },
          },
        },
      },
    });

    const attendancePerformancesNormalized = attendancePerformances
      .filter((a) => a.performances != null)
      .map((attendance) => {
        const perf = attendance.performances!;
        const startTime = moment.tz(perf.startTime, THEATRE_TZ);
        const dayName = startTime.format("dddd");
        const time = startTime.format("HH:mm");
        // The calendar expands run dates as calendar days, so send the theatre-local day.
        const day = moment.utc(startTime.format("YYYY-MM-DD")).toDate();
        return {
          id: perf.id,
          title: perf.musicals?.title || perf.plays?.title,
          duration: perf.musicals?.duration || perf.plays?.duration,
          theatre: perf.theatres.name,
          startDate: day,
          endDate: day,
          dayTimes: { [dayName]: [time] },
          source: "programming",
        };
      });

    // "I'm going" rows: a single day on the calendar.
    const goingRows = await prisma.attendance.findMany({
      where: { user, going: true, seenDate: { gte: firstDayOfMonth } },
      include: {
        musicals: { select: { title: true, duration: true } },
        plays: { select: { title: true, duration: true } },
        theatres: { select: { name: true } },
      },
    });
    const goingNormalized = goingRows
      .filter((a) => a.seenDate != null)
      .map((a) => {
        const day = moment.utc(a.seenDate);
        return {
          id: -a.id,
          title: a.musicals?.title || a.plays?.title,
          duration: a.musicals?.duration || a.plays?.duration,
          theatre: a.theatres?.name ?? "",
          startDate: day.toDate(),
          endDate: day.toDate(),
          dayTimes: { [day.format("dddd")]: ["19:30"] },
          source: "going",
        };
      });

    const performances = [
      ...watchlistPerformances,
      ...attendancePerformancesNormalized,
      ...goingNormalized,
    ];

    performances.sort((a, b) => {
      if (a?.startDate && b?.startDate) {
        return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
      }
      return 0;
    });

    res.status(200).json(performances);
  } catch (error) {
    console.error("Error fetching performances:", error);
    res.status(500).json({ error: "Internal server error." });
  }
}
