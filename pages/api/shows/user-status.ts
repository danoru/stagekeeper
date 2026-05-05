import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";

import { authOptions } from "../auth/[...nextauth]";
import prisma from "../../../src/data/db";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed." });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(200).json({ attendance: [], likedShows: [], watchlist: [] });
  }

  const userId = Number(session.user.id);
  const musicalId = req.query.musicalId ? Number(req.query.musicalId) : null;
  const playId = req.query.playId ? Number(req.query.playId) : null;

  // Targeted: scope to one show. Order-of-magnitude smaller payload.
  if (musicalId || playId) {
    const showFilter = musicalId ? { musical: musicalId } : { play: playId! };

    const [attendance, likedShows, watchlist] = await Promise.all([
      prisma.attendance.findMany({
        where: {
          user: userId,
          OR: [showFilter, { performances: showFilter }],
        },
        include: { performances: true },
      }),
      prisma.likedShows.findMany({ where: { user: userId, ...showFilter } }),
      prisma.watchlist.findMany({ where: { user: userId, ...showFilter } }),
    ]);

    res.setHeader("Cache-Control", "private, no-store");
    return res.status(200).json({ attendance, likedShows, watchlist });
  }

  // Fallback: full history (no current callers, kept for safety).
  const [attendance, likedShows, watchlist] = await Promise.all([
    prisma.attendance.findMany({
      where: { user: userId },
      include: { performances: true },
    }),
    prisma.likedShows.findMany({ where: { user: userId } }),
    prisma.watchlist.findMany({ where: { user: userId } }),
  ]);

  res.setHeader("Cache-Control", "private, no-store");
  return res.status(200).json({ attendance, likedShows, watchlist });
}
