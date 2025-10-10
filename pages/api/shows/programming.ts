import { NextApiRequest, NextApiResponse } from "next";

import prisma from "../../../src/data/db";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { title, type } = req.query;

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed." });
  }

  if (!title || typeof title !== "string" || !type || typeof type !== "string") {
    return res.status(400).json({ error: "Title and type are required." });
  }

  try {
    let performances;

    if (type === "MUSICAL") {
      const musical = await prisma.musicals.findUnique({
        where: {
          title: title,
        },
      });

      if (!musical) {
        return res.status(404).json({ error: "Musical not found." });
      }

      performances = await prisma.programming.findMany({
        where: { musical: musical.id, endDate: { gte: new Date() } },
        include: {
          musicals: {
            select: { id: true, title: true, playbill: true },
          },
        },
        orderBy: { startDate: "asc" },
      });
    } else if (type === "PLAY") {
      const play = await prisma.plays.findUnique({
        where: {
          title: title,
        },
      });

      if (!play) {
        return res.status(404).json({ error: "Play not found." });
      }

      performances = await prisma.programming.findMany({
        where: { play: play.id, endDate: { gte: new Date() } },
        include: {
          plays: {
            select: { id: true, title: true, playbill: true },
          },
        },
        orderBy: { startDate: "asc" },
      });
    } else {
      return res.status(400).json({ error: "Invalid type. Must be 'MUSICAL' or 'PLAY'." });
    }

    // allow short public caching (CDN) for programming results
    res.setHeader("Cache-Control", "public, max-age=60, stale-while-revalidate=120");
    res.status(200).json(performances);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error." });
  }
}
