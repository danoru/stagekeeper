import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";

import prisma from "../../src/data/db";
import {
  hasSeenShow,
  parseSuggestion,
  submitCredits,
  type CreditSuggestion,
} from "../../src/data/people";
import { clientIp, rateLimit } from "../../src/utils/rateLimit";

import { authOptions } from "./auth/[...nextauth]";

const MAX_ROWS = 60;

// POST { programmingId, credits: [{ personId?, name, category, character?, role? }] }
// Members who have seen the show suggest credits; admins' land approved.
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: "Method not allowed." });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).json({ error: "Not authenticated." });
  const userId = Number(session.user.id);
  const isAdmin = session.user.badge === "ADMIN";

  if (!isAdmin && !rateLimit(`credits:${userId}:${clientIp(req)}`, 20, 60 * 60 * 1000)) {
    return res.status(429).json({ error: "Too many suggestions. Try again later." });
  }

  const programmingId = Number(req.body?.programmingId);
  if (!Number.isInteger(programmingId) || programmingId <= 0) {
    return res.status(400).json({ error: "programmingId is required." });
  }
  const raw = req.body?.credits;
  if (!Array.isArray(raw) || raw.length === 0) {
    return res.status(400).json({ error: "Add at least one credit." });
  }
  if (raw.length > MAX_ROWS) {
    return res.status(400).json({ error: `Up to ${MAX_ROWS} credits at a time.` });
  }

  const rows: CreditSuggestion[] = [];
  for (const item of raw) {
    const parsed = parseSuggestion(item);
    if (typeof parsed === "string") return res.status(400).json({ error: parsed });
    rows.push(parsed);
  }

  const production = await prisma.programming.findUnique({
    where: { id: programmingId },
    select: { musical: true, play: true },
  });
  if (!production) return res.status(404).json({ error: "Production not found." });
  const show = production.musical
    ? { musical: production.musical }
    : production.play
      ? { play: production.play }
      : null;
  if (!show) return res.status(404).json({ error: "Production not found." });

  if (!isAdmin && !(await hasSeenShow(userId, show))) {
    return res.status(403).json({ error: "Log this show as seen to suggest its cast and crew." });
  }

  try {
    const result = await submitCredits({ programmingId, userId, approve: isAdmin, rows });
    return res.status(200).json({ ...result, approved: isAdmin });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to save credits." });
  }
}
