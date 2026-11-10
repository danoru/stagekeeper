import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";

import {
  CompanionError,
  getCompanionCandidates,
  getCompanionInvites,
  removeCompanion,
  respondToCompanion,
  tagCompanion,
} from "../../../src/data/companions";
import { rateLimit } from "../../../src/utils/rateLimit";
import { authOptions } from "../auth/[...nextauth]";

// "Went together".
//   GET                     → { invites } waiting for the viewer (+ candidates with ?candidates=1)
//   POST   { attendanceId, username }   tag someone on your own past visit
//   PATCH  { id, action: "accept" | "decline" }
//   DELETE { id }           take a tag back (tagger) or remove yourself (tagged)
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).json({ error: "Not authenticated." });
  const userId = Number(session.user.id);

  try {
    if (req.method === "GET") {
      res.setHeader("Cache-Control", "private, no-store");
      const [invites, candidates] = await Promise.all([
        getCompanionInvites(userId),
        req.query.candidates ? getCompanionCandidates(userId) : Promise.resolve(undefined),
      ]);
      return res.status(200).json({ invites, candidates });
    }
    if (req.method === "POST") {
      if (!(await rateLimit(`companions:${userId}`, 60, 60 * 60 * 1000))) {
        return res.status(429).json({ error: "Too many tags at once. Try again later." });
      }
      const attendanceId = Number(req.body?.attendanceId);
      const username = typeof req.body?.username === "string" ? req.body.username.trim() : "";
      if (!Number.isInteger(attendanceId) || !username) {
        return res.status(400).json({ error: "Pick a visit and a person." });
      }
      await tagCompanion(userId, attendanceId, username);
      return res.status(200).json({ message: "Tagged. They'll see it once they accept." });
    }
    const id = Number(req.body?.id);
    if (!Number.isInteger(id)) return res.status(400).json({ error: "id is required." });
    if (req.method === "PATCH") {
      const action = req.body?.action;
      if (action !== "accept" && action !== "decline") {
        return res.status(400).json({ error: "action must be accept or decline." });
      }
      return res.status(200).json(await respondToCompanion(userId, id, action === "accept"));
    }
    if (req.method === "DELETE") {
      await removeCompanion(userId, id);
      return res.status(200).json({ message: "Removed." });
    }
  } catch (error) {
    if (error instanceof CompanionError) return res.status(400).json({ error: error.message });
    console.error(error);
    return res.status(500).json({ error: "Something went wrong." });
  }

  res.setHeader("Allow", ["GET", "POST", "PATCH", "DELETE"]);
  return res.status(405).json({ error: "Method not allowed." });
}
