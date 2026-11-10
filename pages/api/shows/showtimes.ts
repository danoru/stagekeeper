import { NextApiRequest, NextApiResponse } from "next";

import prisma from "../../../src/data/db";

const LIMIT = 60;

// GET ?musicalId= | ?playId= → the show's upcoming real showtimes (runs at approved theatres),
// soonest first, for the "I'm going" picker. Estimated schedules aren't rows, so they never
// appear here; the dialog falls back to a bare date for those runs.
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ error: "Method not allowed." });
  }
  const musicalId = Number(req.query.musicalId);
  const playId = Number(req.query.playId);
  const show =
    Number.isInteger(musicalId) && musicalId > 0
      ? { musical: musicalId }
      : Number.isInteger(playId) && playId > 0
        ? { play: playId }
        : null;
  if (!show) return res.status(400).json({ error: "musicalId or playId is required." });

  const showtimes = await prisma.performances.findMany({
    where: {
      ...show,
      programming: { not: null },
      startTime: { gte: new Date() },
      theatres: { status: "APPROVED" },
    },
    select: {
      id: true,
      startTime: true,
      status: true,
      label: true,
      theatres: { select: { id: true, name: true } },
    },
    orderBy: { startTime: "asc" },
    take: LIMIT,
  });
  res.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=600");
  return res.status(200).json({ showtimes });
}
