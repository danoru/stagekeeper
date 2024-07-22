import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { musicalTitle } = req.query;

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed." });
  }

  if (!musicalTitle || typeof musicalTitle !== "string") {
    res.status(400).json({ error: "Musical title is required." });
    return;
  }

  try {
    const musical = await prisma.musicals.findUnique({
      where: {
        title: musicalTitle,
      },
    });

    if (!musical) {
      res.status(404).json({ error: "Musical not found." });
      return;
    }

    const performances = await prisma.programming.findMany({
      where: { musical: musical.id },
      include: {
        musicals: true,
      },
    });

    res.status(200).json(performances);
  } catch (error) {
    res.status(500).json({ error: "Internal server error." });
  }
}
