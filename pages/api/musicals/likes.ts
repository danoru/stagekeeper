import prisma from "../../../src/data/db";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method, user, musical } = req.body;

  if (method === "POST") {
    try {
      await prisma.likedMusicals.create({
        data: {
          user,
          musical,
        },
      });
      res.status(200).json({ message: "Added to liked musicals." });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to add to liked musicals." });
    }
  } else if (method === "DELETE") {
    try {
      await prisma.likedMusicals.deleteMany({
        where: {
          user,
          musical,
        },
      });
      res.status(200).json({ message: "Removed from liked musicals." });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to remove from liked musicals." });
    }
  } else {
    res.setHeader("Allow", ["POST", "DELETE"]);
    res.status(405).end(`Method ${method} is not allowed.`);
  }
}
