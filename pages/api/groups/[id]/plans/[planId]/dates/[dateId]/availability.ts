import { Availability } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";

import { authOptions } from "../../../../../../auth/[...nextauth]";
import prisma from "../../../../../../../../src/data/db";
import {
  clearAvailability,
  getPlanWithGroup,
  isGroupMember,
  setAvailability,
} from "../../../../../../../../src/data/groups";

const VALID: Availability[] = ["UNAVAILABLE", "AVAILABLE", "PREFER", "GOING"];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
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
    select: { plan: true },
  });
  if (!date || date.plan !== planId) {
    return res.status(404).json({ error: "Date not found." });
  }

  if (req.method === "POST") {
    const { status } = req.body ?? {};
    if (!VALID.includes(status)) {
      return res.status(400).json({
        error: "status must be UNAVAILABLE, AVAILABLE, PREFER, or GOING.",
      });
    }
    const updated = await setAvailability({
      planDateId: dateId,
      userId,
      status: status as Availability,
    });
    return res.status(200).json({ availability: updated });
  }

  if (req.method === "DELETE") {
    await clearAvailability(dateId, userId);
    return res.status(204).end();
  }

  res.setHeader("Allow", ["POST", "DELETE"]);
  return res.status(405).json({ error: "Method not allowed." });
}
