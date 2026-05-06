import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";

import { authOptions } from "../../../../../auth/[...nextauth]";
import {
  addCandidateDate,
  getPlanWithGroup,
  isGroupMember,
} from "../../../../../../../src/data/groups";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: "Method not allowed." });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).json({ error: "Not authenticated." });
  const userId = Number(session.user.id);

  const groupId = Number(req.query.id);
  const planId = Number(req.query.planId);
  if (!Number.isFinite(groupId) || !Number.isFinite(planId)) {
    return res.status(400).json({ error: "Invalid id." });
  }

  if (!(await isGroupMember(groupId, userId))) {
    return res.status(403).json({ error: "Not a member of this group." });
  }

  const plan = await getPlanWithGroup(planId);
  if (!plan || plan.group !== groupId) {
    return res.status(404).json({ error: "Plan not found." });
  }
  if (plan.status !== "POLLING") {
    return res.status(409).json({ error: "Plan is no longer polling." });
  }

  const { startTime } = req.body ?? {};
  const date = startTime ? new Date(startTime) : null;
  if (!date || Number.isNaN(date.getTime())) {
    return res.status(400).json({ error: "startTime is required." });
  }

  try {
    const created = await addCandidateDate({
      planId,
      startTime: date,
      proposedBy: userId,
    });
    return res.status(201).json({ date: created });
  } catch (e: unknown) {
    if (
      typeof e === "object" &&
      e !== null &&
      "code" in e &&
      (e as { code: string }).code === "P2002"
    ) {
      return res.status(409).json({ error: "That date is already a candidate." });
    }
    console.error(e);
    return res.status(500).json({ error: "Failed to add date." });
  }
}
