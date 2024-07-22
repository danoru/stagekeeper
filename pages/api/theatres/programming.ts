import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

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
    const formattedTheatreName = theatreName
      .replace(/-/g, " ")
      .toLowerCase()
      .replace(/\b\w/g, (char) => char.toUpperCase());

    const theatre = await prisma.theatres.findFirst({
      where: {
        name: formattedTheatreName,
      },
    });

    if (!theatre) {
      res.status(404).json({ error: "Theatre not found." });
      return;
    }

    const performances = await prisma.programming.findMany({
      where: { seasons: { theatre: theatre.id } },
      include: {
        musicals: true,
      },
    });

    res.status(200).json(performances);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
}
