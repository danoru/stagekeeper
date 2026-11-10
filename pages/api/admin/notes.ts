import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";

import prisma from "../../../src/data/db";
import { authOptions } from "../auth/[...nextauth]";

// Admin queue for theatre tips.
//   GET → pending tips, oldest first
//   PATCH { id, action: "approve" } | DELETE { id } (reject)
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session || session.user.badge !== "ADMIN") {
    return res.status(403).json({ error: "Forbidden." });
  }

  if (req.method === "GET") {
    const notes = await prisma.theatreNotes.findMany({
      where: { status: "PENDING" },
      select: {
        id: true,
        category: true,
        text: true,
        createdAt: true,
        theatres: { select: { name: true } },
        users: { select: { username: true } },
      },
      orderBy: { createdAt: "asc" },
    });
    return res.status(200).json({ notes });
  }

  const id = Number(req.body?.id);
  if (!Number.isInteger(id)) return res.status(400).json({ error: "id is required." });

  if (req.method === "PATCH") {
    if (req.body?.action !== "approve") return res.status(400).json({ error: "Unknown action." });
    await prisma.theatreNotes.update({ where: { id }, data: { status: "APPROVED" } });
    return res.status(200).json({ message: "Approved." });
  }
  if (req.method === "DELETE") {
    await prisma.theatreNotes.deleteMany({ where: { id } });
    return res.status(200).json({ message: "Rejected." });
  }

  res.setHeader("Allow", ["GET", "PATCH", "DELETE"]);
  return res.status(405).json({ error: "Method not allowed." });
}
