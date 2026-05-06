import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";

import { authOptions } from "../../../auth/[...nextauth]";
import {
  createPlanWithDates,
  getGroupPlans,
  isGroupMember,
} from "../../../../../src/data/groups";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).json({ error: "Not authenticated." });
  const userId = Number(session.user.id);

  const groupId = Number(req.query.id);
  if (!Number.isFinite(groupId)) {
    return res.status(400).json({ error: "Invalid group id." });
  }

  if (!(await isGroupMember(groupId, userId))) {
    return res.status(403).json({ error: "Not a member of this group." });
  }

  if (req.method === "GET") {
    const plans = await getGroupPlans(groupId);
    return res.status(200).json({ plans });
  }

  if (req.method === "POST") {
    const { programmingId, note, startTimes } = req.body ?? {};
    const programming = Number(programmingId);
    if (!Number.isFinite(programming)) {
      return res.status(400).json({ error: "programmingId is required." });
    }
    if (!Array.isArray(startTimes) || startTimes.length === 0) {
      return res.status(400).json({ error: "At least one candidate date is required." });
    }
    const parsed: Date[] = [];
    for (const t of startTimes) {
      const d = new Date(t);
      if (Number.isNaN(d.getTime())) {
        return res.status(400).json({ error: "Invalid candidate date." });
      }
      parsed.push(d);
    }
    if (note != null && typeof note !== "string") {
      return res.status(400).json({ error: "note must be a string." });
    }
    if (typeof note === "string" && note.length > 500) {
      return res.status(400).json({ error: "note must be 500 characters or fewer." });
    }

    try {
      const plan = await createPlanWithDates({
        groupId,
        programmingId: programming,
        createdBy: userId,
        note: typeof note === "string" ? note.trim() || null : null,
        startTimes: parsed,
      });
      return res.status(201).json({ plan });
    } catch (e) {
      console.error(e);
      return res.status(500).json({ error: "Failed to create plan." });
    }
  }

  res.setHeader("Allow", ["GET", "POST"]);
  return res.status(405).json({ error: "Method not allowed." });
}
