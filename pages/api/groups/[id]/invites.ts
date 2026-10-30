import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";

import { cancelInvite, isGroupOwner } from "../../../../src/data/groups";
import { authOptions } from "../../auth/[...nextauth]";

// Pending username invites for one group (the invite *link* lives in invite.ts).
//   DELETE { userId } — an owner withdraws an invite
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "DELETE") {
    res.setHeader("Allow", ["DELETE"]);
    return res.status(405).json({ error: "Method not allowed." });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).json({ error: "Not authenticated." });

  const groupId = Number(req.query.id);
  const invitee = Number(req.body?.userId);
  if (!Number.isInteger(groupId) || !Number.isInteger(invitee)) {
    return res.status(400).json({ error: "Invalid id." });
  }
  if (!(await isGroupOwner(groupId, Number(session.user.id)))) {
    return res.status(403).json({ error: "Only owners can manage invites." });
  }

  await cancelInvite(groupId, invitee);
  return res.status(204).end();
}
