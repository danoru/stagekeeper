import prisma from "../../../src/data/db";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req.body;
  const { user, type, musical, play } = req.body;

  if (method === "POST") {
    try {
      const data = {
        user,
        type,
        musical: type === "MUSICAL" ? musical : null,
        play: type === "PLAY" ? play : null,
      };

      await prisma.likedShows.create({
        data,
      });
      res.status(200).json({ message: "Added to liked shows." });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to add to liked shows." });
    }
  } else if (method === "DELETE") {
    try {
      await prisma.likedShows.deleteMany({
        where: {
          user,
          type,
          OR: [{ musical }, { play }],
        },
      });
      res.status(200).json({ message: "Removed from liked shows." });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to remove from liked shows." });
    }
  } else {
    res.setHeader("Allow", ["POST", "DELETE"]);
    res.status(405).end(`Method ${method} is not allowed.`);
  }
}
