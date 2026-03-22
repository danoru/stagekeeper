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
    const seasons = await prisma.seasons.findMany({
      include: { theatres: true },
      orderBy: { startDate: "desc" },
    });
    return res.status(200).json(seasons);
  }

  if (req.method === "POST") {
    const { name, theatre, startDate, endDate } = req.body;
    if (!name) return res.status(400).json({ error: "Season name is required." });
    if (!theatre) return res.status(400).json({ error: "Theatre is required." });
    if (!startDate || !endDate)
      return res.status(400).json({ error: "Start and end dates are required." });
    try {
      const season = await prisma.seasons.create({
        data: {
          name,
          theatre: Number(theatre),
          startDate: new Date(startDate),
          endDate: new Date(endDate),
        },
        include: { theatres: true },
      });
      return res.status(201).json(season);
    } catch (e) {
      return res.status(500).json({ error: "Failed to create season." });
    }
  }

  if (req.method === "PUT") {
    const { id, name, theatre, startDate, endDate } = req.body;
    if (!id) return res.status(400).json({ error: "ID is required." });
    try {
      const season = await prisma.seasons.update({
        where: { id: Number(id) },
        data: {
          name,
          theatre: Number(theatre),
          startDate: new Date(startDate),
          endDate: new Date(endDate),
        },
        include: { theatres: true },
      });
      return res.status(200).json(season);
    } catch (e) {
      return res.status(500).json({ error: "Failed to update season." });
    }
  }

  res.setHeader("Allow", ["GET", "POST", "PUT"]);
  return res.status(405).json({ error: `Method ${req.method} not allowed.` });
}
