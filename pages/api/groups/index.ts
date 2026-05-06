import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";

import { authOptions } from "../auth/[...nextauth]";
import prisma from "../../../src/data/db";
import { getUserGroups } from "../../../src/data/groups";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ error: "Not authenticated." });
  }
  const userId = Number(session.user.id);

  if (req.method === "GET") {
    const memberships = await getUserGroups(userId);
    return res.status(200).json({ groups: memberships });
  }

  if (req.method === "POST") {
    const { name } = req.body ?? {};
    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return res.status(400).json({ error: "name is required." });
    }
    const trimmed = name.trim();
    if (trimmed.length > 60) {
      return res.status(400).json({ error: "name must be 60 characters or fewer." });
    }

    try {
      const group = await prisma.$transaction(async (tx) => {
        const created = await tx.groups.create({ data: { name: trimmed } });
        await tx.groupMembership.create({
          data: { group: created.id, user: userId, role: "OWNER" },
        });
        return created;
      });
      return res.status(201).json({ group });
    } catch (e) {
      console.error(e);
      return res.status(500).json({ error: "Failed to create group." });
    }
  }

  res.setHeader("Allow", ["GET", "POST"]);
  return res.status(405).json({ error: "Method not allowed." });
}
