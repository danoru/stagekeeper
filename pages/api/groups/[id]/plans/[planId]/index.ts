import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";

import { authOptions } from "../../../../auth/[...nextauth]";
import {
  cancelPlan,
  confirmPlan,
  deletePlan,
  getPlanWithGroup,
  isGroupMember,
  isGroupOwner,
  reopenPlan,
} from "../../../../../../src/data/groups";

type Action = "confirm" | "cancel" | "reopen";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
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

  const owner = await isGroupOwner(groupId, userId);
  const canMutate = plan.createdBy === userId || owner;

  if (req.method === "DELETE") {
    if (!canMutate) {
      return res.status(403).json({ error: "Only the proposer or owner can delete." });
    }
    await deletePlan(planId);
    return res.status(204).end();
  }

  if (req.method === "PATCH") {
    if (!canMutate) {
      return res.status(403).json({ error: "Only the proposer or owner can change status." });
    }
    const { action, planDateId } = req.body ?? {} as {
      action?: Action;
      planDateId?: number;
    };

    if (action === "confirm") {
      const dateId = Number(planDateId);
      if (!Number.isFinite(dateId)) {
        return res.status(400).json({ error: "planDateId is required to confirm." });
      }
      try {
        const updated = await confirmPlan(planId, dateId);
        return res.status(200).json({ plan: updated });
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Failed to confirm.";
        return res.status(400).json({ error: msg });
      }
    }

    if (action === "cancel") {
      const updated = await cancelPlan(planId);
      return res.status(200).json({ plan: updated });
    }

    if (action === "reopen") {
      const updated = await reopenPlan(planId);
      return res.status(200).json({ plan: updated });
    }

    return res.status(400).json({ error: "action must be confirm, cancel, or reopen." });
  }

  res.setHeader("Allow", ["DELETE", "PATCH"]);
  return res.status(405).json({ error: "Method not allowed." });
}
