import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";

import prisma from "../../../src/data/db";
import { authOptions } from "../auth/[...nextauth]";

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
        select: {
          id: true,
          user: true,
          musical: true,
          play: true,
          seenDate: true,
          going: true,
          performances: { select: { musical: true, play: true } },
        },
      }),
      prisma.likedShows.findMany({
        where: { user: userId, ...showFilter },
        select: { id: true, user: true, musical: true, play: true },
      }),
      prisma.watchlist.findMany({
        where: { user: userId, ...showFilter },
        select: { id: true, user: true, musical: true, play: true },
      }),
    ]);

    res.setHeader("Cache-Control", "private, no-store");
    return res.status(200).json({ attendance, likedShows, watchlist });
  }

  return res.status(400).json({ error: "musicalId or playId is required." });
}
