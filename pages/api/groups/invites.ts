import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";

import { getPendingInvitesForUser, respondToInvite } from "../../../src/data/groups";
import { authOptions } from "../auth/[...nextauth]";

// The signed-in user's group invites.
//   GET                          → pending invites
//   POST { groupId, accept }     → join (accept: true) or decline
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).json({ error: "Not authenticated." });
  const userId = Number(session.user.id);

  if (req.method === "GET") {
    res.setHeader("Cache-Control", "private, no-store");
    return res.status(200).json(await getPendingInvitesForUser(userId));
  }

  if (req.method === "POST") {
    const groupId = Number(req.body?.groupId);
    const accept = req.body?.accept;
    if (!Number.isInteger(groupId) || typeof accept !== "boolean") {
      return res.status(400).json({ error: "groupId and accept are required." });
    }
    const answered = await respondToInvite(groupId, userId, accept);
    if (!answered) return res.status(404).json({ error: "That invite is no longer open." });
    return res.status(200).json({ message: accept ? "Joined." : "Declined.", groupId });
  }

  res.setHeader("Allow", ["GET", "POST"]);
  return res.status(405).json({ error: "Method not allowed." });
}
