import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";

import prisma from "../../../src/data/db";
import { authOptions } from "../auth/[...nextauth]";

function parseRating(raw: unknown): number | null | undefined {
  if (raw === undefined) return undefined;
  if (raw === null || raw === "") return null;
  const n = Number(raw);
  if (!Number.isFinite(n) || n < 0 || n > 5 || (n * 2) % 1 !== 0) {
    throw new Error("Rating must be between 0 and 5 in half-star steps.");
  }
  return n;
}

function parseComment(raw: unknown): string | null | undefined {
  if (raw === undefined) return undefined;
  if (raw === null) return null;
  if (typeof raw !== "string") throw new Error("Comment must be text.");
  const trimmed = raw.trim();
  if (trimmed.length > 500) throw new Error("Comment must be 500 characters or fewer.");
  return trimmed || null;
}

// Dates arrive as "YYYY-MM-DD" from <input type="date">; store them as UTC midnight so the
// @db.Date column round-trips without timezone drift.
function parseSeenDate(raw: unknown): Date | null | undefined {
  if (raw === undefined) return undefined;
  if (raw === null || raw === "") return null;
  if (typeof raw !== "string") throw new Error("Invalid date.");
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(raw);
  if (!m) throw new Error("Invalid date.");
  const d = new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])));
  if (Number.isNaN(d.getTime())) throw new Error("Invalid date.");
  return d;
}

function startOfTodayUtc() {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ error: "Not authenticated." });
  }

  const userId = Number(session.user.id);

  if (req.method === "POST") {
    const { performanceId, musicalId, playId, type, theatreId } = req.body ?? {};
    const going = req.body?.going === true;

    let rating: number | null;
    let comment: string | null;
    let seenDate: Date | null;
    try {
      rating = parseRating(req.body?.rating) ?? null;
      comment = parseComment(req.body?.comment) ?? null;
      seenDate = parseSeenDate(req.body?.seenDate) ?? null;
    } catch (e) {
      return res.status(400).json({ error: (e as Error).message });
    }

    if (going) {
      if (!seenDate) return res.status(400).json({ error: "Pick the date you're going." });
      if (seenDate < startOfTodayUtc()) {
        return res
          .status(400)
          .json({ error: "That date is in the past — log it as seen instead." });
      }
      // A plan isn't a review.
      rating = null;
    }

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
      data = { user: userId, performance: perf.id, rating, comment };
    } else if (type === "MUSICAL" && musicalId) {
      const musical = await prisma.musicals.findUnique({
        where: { id: Number(musicalId) },
        select: { id: true },
      });
      if (!musical) return res.status(404).json({ error: "Musical not found." });
      resolvedMusical = musical.id;
      data = { user: userId, musical: musical.id, seenDate, rating, comment, going };
    } else if (type === "PLAY" && playId) {
      const play = await prisma.plays.findUnique({
        where: { id: Number(playId) },
        select: { id: true },
      });
      if (!play) return res.status(404).json({ error: "Play not found." });
      resolvedPlay = play.id;
      data = { user: userId, play: play.id, seenDate, rating, comment, going };
    } else {
      return res.status(400).json({
        error: "Provide performanceId, or type with musicalId/playId.",
      });
    }

    if (!performanceId && theatreId) {
      const theatre = await prisma.theatres.findUnique({
        where: { id: Number(theatreId) },
        select: { id: true },
      });
      if (!theatre) return res.status(404).json({ error: "Theatre not found." });
      data.theatre = theatre.id;
    }

    try {
      const attendance = await prisma.$transaction(async (tx) => {
        const created = await tx.attendance.create({ data });
        // Seeing a show (or committing to a date) clears it from the watchlist.
        if (resolvedMusical != null) {
          await tx.watchlist.deleteMany({ where: { user: userId, musical: resolvedMusical } });
        }
        if (resolvedPlay != null) {
          await tx.watchlist.deleteMany({ where: { user: userId, play: resolvedPlay } });
        }
        return created;
      });

      return res.status(200).json({
        message: going ? "Marked as going." : "Attendance logged.",
        attendance,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Failed to log attendance." });
    }
  }

  if (req.method === "PATCH") {
    const { attendanceId, theatreId } = req.body ?? {};
    if (!attendanceId) {
      return res.status(400).json({ error: "attendanceId is required." });
    }

    const existing = await prisma.attendance.findFirst({
      where: { id: Number(attendanceId), user: userId },
    });
    if (!existing) {
      return res.status(404).json({ error: "Attendance record not found." });
    }

    let rating: number | null | undefined;
    let comment: string | null | undefined;
    let seenDate: Date | null | undefined;
    try {
      rating = parseRating(req.body?.rating);
      comment = parseComment(req.body?.comment);
      seenDate = parseSeenDate(req.body?.seenDate);
    } catch (e) {
      return res.status(400).json({ error: (e as Error).message });
    }
    const going = typeof req.body?.going === "boolean" ? req.body.going : undefined;

    try {
      const updated = await prisma.attendance.update({
        where: { id: existing.id },
        data: {
          rating: rating !== undefined ? rating : existing.rating,
          comment: comment !== undefined ? comment : existing.comment,
          seenDate: seenDate !== undefined ? seenDate : existing.seenDate,
          going: going !== undefined ? going : existing.going,
          theatre:
            theatreId !== undefined ? (theatreId ? Number(theatreId) : null) : existing.theatre,
        },
      });
      return res.status(200).json({ message: "Attendance updated.", attendance: updated });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Failed to update attendance." });
    }
  }

  if (req.method === "DELETE") {
    const { attendanceId } = req.body ?? {};
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
