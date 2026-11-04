import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";

import { respondToInvite } from "../../../src/data/groups";
import { authOptions } from "../auth/[...nextauth]";

// POST { groupId, accept } — the signed-in user joins (accept: true) or declines a group invite.
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).json({ error: "Not authenticated." });
  const userId = Number(session.user.id);

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

  res.setHeader("Allow", ["POST"]);
  return res.status(405).json({ error: "Method not allowed." });
}
