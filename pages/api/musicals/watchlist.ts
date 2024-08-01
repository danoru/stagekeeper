import prisma from "../../../src/data/db";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method, user, musical } = req.body;

  if (method === "POST") {
    try {
      await prisma.watchlist.create({
        data: {
          user,
          musical,
        },
      });
      res.status(200).json({ message: "Added to watchlist." });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to add to watchlist." });
    }
  } else if (method === "DELETE") {
    try {
      await prisma.watchlist.deleteMany({
        where: {
          user,
          musical,
        },
      });
      res.status(200).json({ message: "Removed from watchlist." });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to remove from watchlist." });
    }
  } else {
    res.setHeader("Allow", ["POST", "DELETE"]);
    res.status(405).end(`Method ${method} is not allowed.`);
  }
}
