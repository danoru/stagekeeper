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
    if (type === "MUSICAL" ? !musical : !play) {
      return res.status(400).json({ error: "Missing show identifier." });
    }
    try {
      if (type === "MUSICAL") {
        await prisma.likedShows.upsert({
          where: { user_musical: { user: userId, musical } },
          create: { user: userId, type, musical, play: null },
          update: {},
        });
      } else {
        await prisma.likedShows.upsert({
          where: { user_play: { user: userId, play } },
          create: { user: userId, type, musical: null, play },
          update: {},
        });
      }
      return res.status(200).json({ message: "Added to liked shows." });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Failed to add to liked shows." });
    }
  }

  if (req.method === "DELETE") {
    try {
      await prisma.likedShows.deleteMany({
        where: {
          user: userId,
          type,
          OR: [{ musical }, { play }],
        },
      });
      return res.status(200).json({ message: "Removed from liked shows." });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Failed to remove from liked shows." });
    }
  }

  res.setHeader("Allow", ["POST", "DELETE"]);
  return res.status(405).end(`Method ${req.method} is not allowed.`);
}
