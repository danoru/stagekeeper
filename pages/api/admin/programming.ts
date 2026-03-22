import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";

import { authOptions } from "../auth/[...nextauth]";
import prisma from "../../../src/data/db";

async function requireAdmin(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session || session.user.badge !== "ADMIN") {
    res.status(403).json({ error: "Forbidden." });
    return null;
  }
  return session;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const admin = await requireAdmin(req, res);
  if (!admin) return;

  if (req.method === "GET") {
    const programming = await prisma.programming.findMany({
      include: {
        musicals: true,
        plays: true,
        seasons: { include: { theatres: true } },
      },
      orderBy: { startDate: "desc" },
    });
    return res.status(200).json(programming);
  }

  if (req.method === "POST") {
    const { type, musical, play, season, startDate, endDate, dayTimes } = req.body;
    if (!type) return res.status(400).json({ error: "Type is required." });
    if (!season) return res.status(400).json({ error: "Season is required." });
    if (!startDate || !endDate)
      return res.status(400).json({ error: "Start and end dates are required." });
    if (type === "MUSICAL" && !musical)
      return res.status(400).json({ error: "Musical is required." });
    if (type === "PLAY" && !play) return res.status(400).json({ error: "Play is required." });

    try {
      const program = await prisma.programming.create({
        data: {
          type,
          musical: type === "MUSICAL" ? Number(musical) : null,
          play: type === "PLAY" ? Number(play) : null,
          season: Number(season),
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          dayTimes: dayTimes || {},
        },
        include: {
          musicals: true,
          plays: true,
          seasons: { include: { theatres: true } },
        },
      });
      return res.status(201).json(program);
    } catch (e) {
      return res.status(500).json({ error: "Failed to create programming entry." });
    }
  }

  if (req.method === "PUT") {
    const { id, type, musical, play, season, startDate, endDate, dayTimes } = req.body;
    if (!id) return res.status(400).json({ error: "ID is required." });
    try {
      const program = await prisma.programming.update({
        where: { id: Number(id) },
        data: {
          type,
          musical: type === "MUSICAL" ? Number(musical) : null,
          play: type === "PLAY" ? Number(play) : null,
          season: Number(season),
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          dayTimes: dayTimes || {},
        },
        include: {
          musicals: true,
          plays: true,
          seasons: { include: { theatres: true } },
        },
      });
      return res.status(200).json(program);
    } catch (e) {
      return res.status(500).json({ error: "Failed to update programming entry." });
    }
  }

  if (req.method === "DELETE") {
    const { id } = req.body;
    if (!id) return res.status(400).json({ error: "ID is required." });
    try {
      await prisma.programming.delete({ where: { id: Number(id) } });
      return res.status(200).json({ message: "Deleted." });
    } catch (e) {
      return res.status(500).json({ error: "Failed to delete programming entry." });
    }
  }

  res.setHeader("Allow", ["GET", "POST", "PUT", "DELETE"]);
  return res.status(405).json({ error: `Method ${req.method} not allowed.` });
}
