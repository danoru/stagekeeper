import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";

import prisma from "../../../../src/data/db";
import { isEmailVerified, VERIFY_EMAIL_MESSAGE } from "../../../../src/data/emailVerification";
import {
  changeMemberRole,
  inviteToGroup,
  isGroupOwner,
  removeMember,
} from "../../../../src/data/groups";
import { rateLimit } from "../../../../src/utils/rateLimit";
import { authOptions } from "../../auth/[...nextauth]";

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

  // POST { username } — owners invite someone; they join only once they accept.
  if (req.method === "POST") {
    if (!(await isGroupOwner(groupId, userId))) {
      return res.status(403).json({ error: "Only the owner can invite members." });
    }
    if (!(await isEmailVerified(userId))) {
      return res.status(403).json({ error: VERIFY_EMAIL_MESSAGE });
    }
    if (!(await rateLimit(`group-invite:${userId}`, 30, 60 * 60 * 1000))) {
      return res.status(429).json({ error: "Too many invites. Try again later." });
    }
    const { username } = req.body ?? {};
    if (!username || typeof username !== "string") {
      return res.status(400).json({ error: "username is required." });
    }

    const target = await prisma.users.findUnique({
      where: { username: username.trim() },
      select: { id: true },
    });
    if (!target) return res.status(404).json({ error: "User not found." });

    const result = await inviteToGroup(groupId, target.id, userId);
    if (result === "already-member") {
      return res.status(409).json({ error: "User is already a member." });
    }
    if (result === "already-invited") {
      return res.status(409).json({ error: "User has already been invited." });
    }
    return res.status(201).json({ message: "Invited." });
  }

  // PATCH { username, role } — owners promote members to co-owner or demote
  // other owners. The last owner can't be demoted (hand off first).
  if (req.method === "PATCH") {
    const { username, role } = req.body ?? {};
    if (!username || typeof username !== "string") {
      return res.status(400).json({ error: "username is required." });
    }
    if (role !== "OWNER" && role !== "MEMBER") {
      return res.status(400).json({ error: "role must be OWNER or MEMBER." });
    }

    const target = await prisma.users.findUnique({ where: { username }, select: { id: true } });
    if (!target) return res.status(404).json({ error: "User not found." });

    const result = await changeMemberRole(groupId, target.id, role, userId);
    if (result === "forbidden") {
      return res.status(403).json({ error: "Only an owner can change roles." });
    }
    if (result === "not-member") {
      return res.status(404).json({ error: "Membership not found." });
    }
    if (result === "last-owner") {
      return res.status(409).json({
        error: "A group needs at least one owner. Make someone else an owner first.",
      });
    }
    return res.status(200).json({ message: "Role updated." });
  }

  // DELETE { username } — leave the group, or as an owner remove someone else.
  if (req.method === "DELETE") {
    const { username } = req.body ?? {};
    if (!username || typeof username !== "string") {
      return res.status(400).json({ error: "username is required." });
    }

    const target = await prisma.users.findUnique({ where: { username }, select: { id: true } });
    if (!target) return res.status(404).json({ error: "User not found." });

    const result = await removeMember(groupId, target.id, userId);
    if (result === "forbidden") {
      return res.status(403).json({ error: "Not allowed to remove this member." });
    }
    if (result === "not-member") {
      return res.status(404).json({ error: "Membership not found." });
    }
    if (result === "last-owner") {
      return res.status(409).json({ error: "Make another member an owner before leaving." });
    }
    return res.status(204).end();
  }

  res.setHeader("Allow", ["POST", "PATCH", "DELETE"]);
  return res.status(405).json({ error: "Method not allowed." });
}
