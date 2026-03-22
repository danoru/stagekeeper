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
  const { performanceId, musicalId, playId, type, rating, comment } = req.body;

  if (req.method === "POST") {
    // Find the most recent performance for this show, or use a provided performanceId.
    // If no performanceId supplied, look up the latest performance for this show.
    let resolvedPerformanceId = performanceId;

    if (!resolvedPerformanceId) {
      const latestPerformance = await prisma.performances.findFirst({
        where: {
          ...(type === "MUSICAL" ? { musical: musicalId } : { play: playId }),
          startTime: { lte: new Date() },
        },
        orderBy: { startTime: "desc" },
      });

      if (!latestPerformance) {
        return res.status(404).json({ error: "No performance found for this show." });
      }
      resolvedPerformanceId = latestPerformance.id;
    }

    // Check if attendance already exists for this user + performance
    const existing = await prisma.attendance.findFirst({
      where: { user: userId, performance: resolvedPerformanceId },
    });

    if (existing) {
      // Update rating/comment on existing record
      const updated = await prisma.attendance.update({
        where: { id: existing.id },
        data: {
          rating: rating ?? existing.rating,
          comment: comment ?? existing.comment,
        },
      });
      return res.status(200).json({ message: "Attendance updated.", attendance: updated });
    }

    try {
      const attendance = await prisma.attendance.create({
        data: {
          user: userId,
          performance: resolvedPerformanceId,
          rating: rating ?? null,
          comment: comment ?? null,
        },
      });
      return res.status(200).json({ message: "Attendance logged.", attendance });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Failed to log attendance." });
    }
  }

  if (req.method === "PATCH") {
    const { attendanceId } = req.body;
    if (!attendanceId) {
      return res.status(400).json({ error: "attendanceId is required." });
    }

    const existing = await prisma.attendance.findFirst({
      where: { id: attendanceId, user: userId },
    });
    if (!existing) {
      return res.status(404).json({ error: "Attendance record not found." });
    }

    try {
      const updated = await prisma.attendance.update({
        where: { id: attendanceId },
        data: {
          rating: rating !== undefined ? rating : existing.rating,
          comment: comment !== undefined ? comment : existing.comment,
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
        where: { id: attendanceId, user: userId },
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
