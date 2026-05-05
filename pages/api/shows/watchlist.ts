import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";

import { authOptions } from "../auth/[...nextauth]";
import prisma from "../../../src/data/db";

export default async function handle(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ error: "Not authenticated." });
  }

  const userId = Number(session.user.id);
  const { type, musical, play } = req.body;

  if (req.method === "POST") {
    try {
      await prisma.watchlist.create({
        data: {
          user: userId,
          type,
          musical: type === "MUSICAL" ? musical : null,
          play: type === "PLAY" ? play : null,
        },
      });
      return res.status(200).json({ message: "Added to watchlist." });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Failed to add to watchlist." });
    }
  }

  if (req.method === "DELETE") {
    try {
      await prisma.watchlist.deleteMany({
        where: {
          user: userId,
          type,
          musical: type === "MUSICAL" ? musical : undefined,
          play: type === "PLAY" ? play : undefined,
        },
      });
      return res.status(200).json({ message: "Removed from watchlist." });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Failed to remove from watchlist." });
    }
  }

  res.setHeader("Allow", ["POST", "DELETE"]);
  return res.status(405).end(`Method ${req.method} is not allowed.`);
}
