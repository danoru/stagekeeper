import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";

import { isGroupOwner, rotateInviteToken } from "../../../../src/data/groups";
import { authOptions } from "../../auth/[...nextauth]";

// POST → issue a fresh invite token (invalidates the old link). Owner only.
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: "Method not allowed." });
  }
  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).json({ error: "Not authenticated." });

  const groupId = Number(req.query.id);
  if (!Number.isFinite(groupId)) return res.status(400).json({ error: "Invalid group id." });
  if (!(await isGroupOwner(groupId, Number(session.user.id)))) {
    return res.status(403).json({ error: "Only the owner can reset the invite link." });
  }
  const updated = await rotateInviteToken(groupId);
  return res.status(200).json(updated);
}
