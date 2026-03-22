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
    const users = await prisma.users.findMany({
      orderBy: { username: "asc" },
      select: {
        id: true,
        username: true,
        email: true,
        badge: true,
        createdAt: true,
        firstName: true,
        lastName: true,
        _count: { select: { attendance: true, logs: true } },
      },
    });
    return res.status(200).json(users);
  }

  if (req.method === "PUT") {
    const { id, badge } = req.body;
    if (!id) return res.status(400).json({ error: "ID is required." });
    if (!["ADMIN", "PATRON", "USER"].includes(badge)) {
      return res.status(400).json({ error: "Invalid badge value." });
    }
    // Prevent removing own admin status
    if (Number(id) === Number(admin.user.id) && badge !== "ADMIN") {
      return res.status(400).json({ error: "You cannot remove your own admin status." });
    }
    try {
      const user = await prisma.users.update({
        where: { id: Number(id) },
        data: { badge },
        select: { id: true, username: true, badge: true },
      });
      return res.status(200).json(user);
    } catch (e) {
      return res.status(500).json({ error: "Failed to update user badge." });
    }
  }

  res.setHeader("Allow", ["GET", "PUT"]);
  return res.status(405).json({ error: `Method ${req.method} not allowed.` });
}
