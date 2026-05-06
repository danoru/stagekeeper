import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";

import { authOptions } from "../../../../../../auth/[...nextauth]";
import prisma from "../../../../../../../../src/data/db";
import {
  getPlanWithGroup,
  isGroupMember,
  isGroupOwner,
  removeCandidateDate,
} from "../../../../../../../../src/data/groups";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "DELETE") {
    res.setHeader("Allow", ["DELETE"]);
    return res.status(405).json({ error: "Method not allowed." });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).json({ error: "Not authenticated." });
  const userId = Number(session.user.id);

  const groupId = Number(req.query.id);
  const planId = Number(req.query.planId);
  const dateId = Number(req.query.dateId);
  if (!Number.isFinite(groupId) || !Number.isFinite(planId) || !Number.isFinite(dateId)) {
    return res.status(400).json({ error: "Invalid id." });
  }

  if (!(await isGroupMember(groupId, userId))) {
    return res.status(403).json({ error: "Not a member of this group." });
  }

  const plan = await getPlanWithGroup(planId);
  if (!plan || plan.group !== groupId) {
    return res.status(404).json({ error: "Plan not found." });
  }

  const date = await prisma.groupPlanDate.findUnique({
    where: { id: dateId },
    select: { plan: true, proposedBy: true },
  });
  if (!date || date.plan !== planId) {
    return res.status(404).json({ error: "Date not found." });
  }

  const owner = await isGroupOwner(groupId, userId);
  const canRemove = date.proposedBy === userId || plan.createdBy === userId || owner;
  if (!canRemove) {
    return res.status(403).json({ error: "Not allowed to remove this date." });
  }

  await removeCandidateDate(dateId);
  return res.status(204).end();
}
