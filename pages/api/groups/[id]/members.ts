import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";

import { authOptions } from "../../auth/[...nextauth]";
import prisma from "../../../../src/data/db";
import { getGroupMembership, isGroupOwner } from "../../../../src/data/groups";

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

  if (req.method === "POST") {
    if (!(await isGroupOwner(groupId, userId))) {
      return res.status(403).json({ error: "Only the owner can add members." });
    }
    const { username } = req.body ?? {};
    if (!username || typeof username !== "string") {
      return res.status(400).json({ error: "username is required." });
    }

    const target = await prisma.users.findUnique({ where: { username } });
    if (!target) return res.status(404).json({ error: "User not found." });

    const existing = await getGroupMembership(groupId, target.id);
    if (existing) {
      return res.status(409).json({ error: "User is already a member." });
    }

    const membership = await prisma.groupMembership.create({
      data: { group: groupId, user: target.id, role: "MEMBER" },
    });
    return res.status(201).json({ membership });
  }

  if (req.method === "DELETE") {
    const { username } = req.body ?? {};
    if (!username || typeof username !== "string") {
      return res.status(400).json({ error: "username is required." });
    }

    const target = await prisma.users.findUnique({ where: { username } });
    if (!target) return res.status(404).json({ error: "User not found." });

    const isSelf = target.id === userId;
    const owner = await isGroupOwner(groupId, userId);
    if (!isSelf && !owner) {
      return res.status(403).json({ error: "Not allowed to remove this member." });
    }

    const targetMembership = await getGroupMembership(groupId, target.id);
    if (!targetMembership) {
      return res.status(404).json({ error: "Membership not found." });
    }

    if (targetMembership.role === "OWNER") {
      const ownerCount = await prisma.groupMembership.count({
        where: { group: groupId, role: "OWNER" },
      });
      if (ownerCount <= 1) {
        return res.status(409).json({
          error: "Promote another member to owner before leaving.",
        });
      }
    }

    await prisma.groupMembership.delete({
      where: { group_user: { group: groupId, user: target.id } },
    });
    return res.status(204).end();
  }

  res.setHeader("Allow", ["POST", "DELETE"]);
  return res.status(405).json({ error: "Method not allowed." });
}
