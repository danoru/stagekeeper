import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";

import { authOptions } from "../auth/[...nextauth]";
import prisma from "../../../src/data/db";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ error: "Not authenticated." });
  }

  const userId = Number(session.user.id);

  if (req.method === "POST") {
    const {
      performanceId,
      musicalId,
      playId,
      type,
      theatreId,
      seenDate,
      rating,
      comment,
    } = req.body;

    let data: any;
    let resolvedMusical: number | null = null;
    let resolvedPlay: number | null = null;

    if (performanceId) {
      const perf = await prisma.performances.findUnique({
        where: { id: Number(performanceId) },
      });
      if (!perf) {
        return res.status(404).json({ error: "Performance not found." });
      }
      resolvedMusical = perf.musical ?? null;
      resolvedPlay = perf.play ?? null;
      data = {
        user: userId,
        performance: perf.id,
        rating: rating ?? null,
        comment: comment ?? null,
      };
    } else if (type === "MUSICAL" && musicalId) {
      resolvedMusical = Number(musicalId);
      data = {
        user: userId,
        musical: Number(musicalId),
        theatre: theatreId ? Number(theatreId) : null,
        seenDate: seenDate ? new Date(seenDate) : null,
        rating: rating ?? null,
        comment: comment ?? null,
      };
    } else if (type === "PLAY" && playId) {
      resolvedPlay = Number(playId);
      data = {
        user: userId,
        play: Number(playId),
        theatre: theatreId ? Number(theatreId) : null,
        seenDate: seenDate ? new Date(seenDate) : null,
        rating: rating ?? null,
        comment: comment ?? null,
      };
    } else {
      return res.status(400).json({
        error: "Provide performanceId, or type with musicalId/playId.",
      });
    }

    try {
      const attendance = await prisma.attendance.create({ data });

      // Auto-clear matching watchlist row(s) for this show.
      if (resolvedMusical != null) {
        await prisma.watchlist.deleteMany({
          where: { user: userId, musical: resolvedMusical },
        });
      }
      if (resolvedPlay != null) {
        await prisma.watchlist.deleteMany({
          where: { user: userId, play: resolvedPlay },
        });
      }

      return res.status(200).json({ message: "Attendance logged.", attendance });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Failed to log attendance." });
    }
  }

  if (req.method === "PATCH") {
    const { attendanceId, rating, comment, seenDate, theatreId } = req.body;
    if (!attendanceId) {
      return res.status(400).json({ error: "attendanceId is required." });
    }

    const existing = await prisma.attendance.findFirst({
      where: { id: Number(attendanceId), user: userId },
    });
    if (!existing) {
      return res.status(404).json({ error: "Attendance record not found." });
    }

    try {
      const updated = await prisma.attendance.update({
        where: { id: existing.id },
        data: {
          rating: rating !== undefined ? rating : existing.rating,
          comment: comment !== undefined ? comment : existing.comment,
          seenDate:
            seenDate !== undefined
              ? seenDate
                ? new Date(seenDate)
                : null
              : existing.seenDate,
          theatre:
            theatreId !== undefined
              ? theatreId
                ? Number(theatreId)
                : null
              : existing.theatre,
        },
      });
      return res.status(200).json({ message: "Attendance updated.", attendance: updated });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Failed to update attendance." });
    }
  }

  if (req.method === "DELETE") {
    const { attendanceId } = req.body;
    if (!attendanceId) {
      return res.status(400).json({ error: "attendanceId is required." });
    }

    try {
      await prisma.attendance.deleteMany({
        where: { id: Number(attendanceId), user: userId },
      });
      return res.status(200).json({ message: "Attendance removed." });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Failed to remove attendance." });
    }
  }

  res.setHeader("Allow", ["POST", "PATCH", "DELETE"]);
  return res.status(405).json({ error: `Method ${req.method} not allowed.` });
}
