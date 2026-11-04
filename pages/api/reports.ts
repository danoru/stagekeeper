import type { ReportTarget } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";

import { fileReport } from "../../src/data/reports";
import { rateLimit } from "../../src/utils/rateLimit";
import { REPORT_REASONS } from "../../src/utils/reportReasons";

import { authOptions } from "./auth/[...nextauth]";

const TARGETS: ReportTarget[] = ["MUSICAL", "PLAY", "THEATRE", "PERSON", "USER"];

// POST { targetType, targetId, reason, details? } — a member flags something for an admin.
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: "Method not allowed." });
  }
  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).json({ error: "Not authenticated." });
  const userId = Number(session.user.id);

  if (!(await rateLimit(`report:${userId}`, 10, 60 * 60 * 1000))) {
    return res.status(429).json({ error: "Too many reports. Try again later." });
  }

  const { targetType, reason, details } = req.body ?? {};
  const targetId = Number(req.body?.targetId);
  if (!TARGETS.includes(targetType) || !Number.isInteger(targetId) || targetId <= 0) {
    return res.status(400).json({ error: "Invalid report." });
  }
  if (!REPORT_REASONS.includes(reason)) {
    return res.status(400).json({ error: "Pick a reason." });
  }

  const filed = await fileReport({ reporter: userId, targetType, targetId, reason, details });
  if (!filed) return res.status(404).json({ error: "That page no longer exists." });
  return res.status(201).json({ message: "Thanks. An admin will take a look." });
}
