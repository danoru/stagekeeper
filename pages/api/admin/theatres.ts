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
    const theatres = await prisma.theatres.findMany({ orderBy: { name: "asc" } });
    return res.status(200).json(theatres);
  }

  if (req.method === "POST") {
    const { name, location, address, link, image } = req.body;
    if (!name) return res.status(400).json({ error: "Name is required." });
    if (!location) return res.status(400).json({ error: "Location is required." });
    try {
      const theatre = await prisma.theatres.create({
        data: {
          name,
          location,
          address: address || null,
          link: link || null,
          image: image || "https://picsum.photos/649/1024",
        },
      });
      return res.status(201).json(theatre);
    } catch (e) {
      return res.status(500).json({ error: "Failed to create theatre." });
    }
  }

  if (req.method === "PUT") {
    const { id, name, location, address, link, image } = req.body;
    if (!id) return res.status(400).json({ error: "ID is required." });
    try {
      const theatre = await prisma.theatres.update({
        where: { id: Number(id) },
        data: {
          name,
          location,
          address: address || null,
          link: link || null,
          image: image || "https://picsum.photos/649/1024",
        },
      });
      return res.status(200).json(theatre);
    } catch (e) {
      return res.status(500).json({ error: "Failed to update theatre." });
    }
  }

  res.setHeader("Allow", ["GET", "POST", "PUT"]);
  return res.status(405).json({ error: `Method ${req.method} not allowed.` });
}
