import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";

import { authOptions } from "../../auth/[...nextauth]";
import prisma from "../../../../src/data/db";
import { getGroupById, isGroupMember, isGroupOwner } from "../../../../src/data/groups";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ error: "Not authenticated." });
  }
  const userId = Number(session.user.id);

  const groupId = Number(req.query.id);
  if (!Number.isFinite(groupId)) {
    return res.status(400).json({ error: "Invalid group id." });
  }

  if (req.method === "GET") {
    if (!(await isGroupMember(groupId, userId))) {
      return res.status(403).json({ error: "Not a member of this group." });
    }
    const group = await getGroupById(groupId);
    if (!group) return res.status(404).json({ error: "Group not found." });
    return res.status(200).json({ group });
  }

  if (req.method === "PATCH") {
    if (!(await isGroupOwner(groupId, userId))) {
      return res.status(403).json({ error: "Only the owner can rename a group." });
    }
    const { name } = req.body ?? {};
    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return res.status(400).json({ error: "name is required." });
    }
    const trimmed = name.trim();
    if (trimmed.length > 60) {
      return res.status(400).json({ error: "name must be 60 characters or fewer." });
    }
    const group = await prisma.groups.update({
      where: { id: groupId },
      data: { name: trimmed },
    });
    return res.status(200).json({ group });
  }

  if (req.method === "DELETE") {
    if (!(await isGroupOwner(groupId, userId))) {
      return res.status(403).json({ error: "Only the owner can delete a group." });
    }
    await prisma.$transaction([
      prisma.groupMembership.deleteMany({ where: { group: groupId } }),
      prisma.groups.delete({ where: { id: groupId } }),
    ]);
    return res.status(204).end();
  }

  res.setHeader("Allow", ["GET", "PATCH", "DELETE"]);
  return res.status(405).json({ error: "Method not allowed." });
}
