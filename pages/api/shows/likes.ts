import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";

import prisma from "../../../src/data/db";
import { authOptions } from "../auth/[...nextauth]";

export default async function handle(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ error: "Not authenticated." });
  }

  const userId = Number(session.user.id);
  const { type } = req.body ?? {};
  const musical = req.body?.musical != null ? Number(req.body.musical) : undefined;
  const play = req.body?.play != null ? Number(req.body.play) : undefined;

  if (type !== "MUSICAL" && type !== "PLAY") {
    return res.status(400).json({ error: "type must be MUSICAL or PLAY." });
  }
  const showId = type === "MUSICAL" ? musical : play;
  if (!showId) {
    return res.status(400).json({ error: "Missing show identifier." });
  }

  if (req.method === "POST") {
    try {
      if (type === "MUSICAL") {
        await prisma.likedShows.upsert({
          where: { user_musical: { user: userId, musical: showId } },
          create: { user: userId, type, musical: showId, play: null },
          update: {},
        });
      } else {
        await prisma.likedShows.upsert({
          where: { user_play: { user: userId, play: showId } },
          create: { user: userId, type, musical: null, play: showId },
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
      // Scope strictly to the one show: an undefined `play`/`musical` inside an OR would
      // match every row of this type.
      await prisma.likedShows.deleteMany({
        where: {
          user: userId,
          type,
          ...(type === "MUSICAL" ? { musical: showId } : { play: showId }),
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
