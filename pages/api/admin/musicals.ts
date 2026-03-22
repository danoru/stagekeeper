import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";

import { authOptions } from "../auth/[...nextauth]";
import prisma from "../../../src/data/db";

async function requireAdmin(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session || session.user.badge !== "ADMIN") {
    res.status(403).json({ error: "Forbidden." });
    return null;
  }
  return session;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const admin = await requireAdmin(req, res);
  if (!admin) return;

  if (req.method === "GET") {
    const musicals = await prisma.musicals.findMany({
      orderBy: { title: "asc" },
    });
    return res.status(200).json(musicals);
  }

  if (req.method === "POST") {
    const { title, musicBy, lyricsBy, bookBy, premiere, duration, playbill } = req.body;
    if (!title) return res.status(400).json({ error: "Title is required." });
    try {
      const musical = await prisma.musicals.create({
        data: {
          title,
          musicBy: musicBy || "",
          lyricsBy: lyricsBy || "",
          bookBy: bookBy || "",
          premiere: premiere ? new Date(premiere) : null,
          duration: duration ? Number(duration) : null,
          playbill: playbill || "https://picsum.photos/649/1024",
        },
      });
      return res.status(201).json(musical);
    } catch (e: any) {
      if (e.code === "P2002")
        return res.status(409).json({ error: "A musical with that title already exists." });
      return res.status(500).json({ error: "Failed to create musical." });
    }
  }

  if (req.method === "PUT") {
    const { id, title, musicBy, lyricsBy, bookBy, premiere, duration, playbill } = req.body;
    if (!id) return res.status(400).json({ error: "ID is required." });
    try {
      const musical = await prisma.musicals.update({
        where: { id: Number(id) },
        data: {
          title,
          musicBy: musicBy || "",
          lyricsBy: lyricsBy || "",
          bookBy: bookBy || "",
          premiere: premiere ? new Date(premiere) : null,
          duration: duration ? Number(duration) : null,
          playbill: playbill || "https://picsum.photos/649/1024",
        },
      });
      return res.status(200).json(musical);
    } catch (e: any) {
      if (e.code === "P2002")
        return res.status(409).json({ error: "A musical with that title already exists." });
      return res.status(500).json({ error: "Failed to update musical." });
    }
  }

  res.setHeader("Allow", ["GET", "POST", "PUT"]);
  return res.status(405).json({ error: `Method ${req.method} not allowed.` });
}
