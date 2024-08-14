import prisma from "../../../src/data/db";
import { NextApiRequest, NextApiResponse } from "next";
import moment from "moment-timezone";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { userId } = req.query;

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed." });
  }

  if (!userId || typeof userId !== "string") {
    return res.status(400).json({ error: "User ID is required." });
  }

  try {
    const watchlist = await prisma.watchlist.findMany({
      where: {
        user: Number(userId),
        musicals: {
          programming: {
            some: {
              endDate: { gte: new Date() },
            },
          },
        },
      },
      select: {
        musicals: {
          include: {
            programming: {
              include: {
                musicals: { select: { title: true, duration: true } },
                seasons: { include: { theatres: { select: { name: true } } } },
              },
            },
          },
        },
      },
    });

    const watchlistPerformances = watchlist.flatMap((watchItem) =>
      watchItem.musicals?.programming
        .filter((program) => program.endDate && program.endDate >= new Date())
        .map((program) => ({
          id: program.id,
          title: program.musicals?.title,
          duration: program.musicals?.duration,
          theatre: program.seasons?.theatres.name,
          startDate: program.startDate,
          endDate: program.endDate,
          dayTimes: program.dayTimes,
          source: "watchlist",
        }))
    );

    const date = new Date();
    const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);

    const attendancePerformances = await prisma.attendance.findMany({
      where: {
        user: Number(userId),
        performances: { startTime: { gte: firstDayOfMonth } },
      },
      select: {
        performances: {
          include: {
            musicals: { select: { title: true, duration: true } },
            theatres: { select: { name: true } },
          },
        },
      },
    });

    const attendancePerformancesNormalized = attendancePerformances.map(
      (attendance) => {
        const startTime = moment.tz(
          attendance.performances.startTime,
          "America/Los_Angeles"
        );
        const dayName = startTime.format("dddd");
        const time = startTime.format("HH:mm");
        return {
          id: attendance.performances.id,
          title: attendance.performances.musicals?.title,
          duration: attendance.performances.musicals?.duration,
          theatre: attendance.performances.theatres.name,
          startDate: attendance.performances.startTime,
          endDate: attendance.performances.endTime,
          dayTimes: { [dayName]: [time] },
          source: "programming",
        };
      }
    );

    const performances = [
      ...watchlistPerformances,
      ...attendancePerformancesNormalized,
    ];

    performances.sort((a, b) => {
      if (a?.startDate && b?.startDate) {
        return (
          new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
        );
      }
      return 0;
    });

    res.status(200).json(performances);
  } catch (error) {
    console.error("Error fetching performances:", error);
    res.status(500).json({ error: "Internal server error." });
  }
}
