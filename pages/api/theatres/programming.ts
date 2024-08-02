import prisma from "../../../src/data/db";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { theatreName } = req.query;

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed." });
  }

  if (!theatreName || typeof theatreName !== "string") {
    res.status(400).json({ error: "Theatre name is required." });
    return;
  }

  try {
    const theatre = await prisma.theatres.findFirst({
      where: {
        name: theatreName,
      },
    });

    if (!theatre) {
      res.status(404).json({ error: "Theatre not found." });
      return;
    }

    const performances = await prisma.programming.findMany({
      where: { seasons: { theatre: theatre.id, endDate: { gte: new Date() } } },
      include: {
        musicals: true,
      },
    });

    res.status(200).json(performances);
  } catch (error) {
    res.status(500).json({ error: "Internal server error." });
  }
}
