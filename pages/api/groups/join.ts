import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";

import { joinGroupByInvite } from "../../../src/data/groups";
import { authOptions } from "../auth/[...nextauth]";

// POST { token } → join the group behind an invite link.
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: "Method not allowed." });
  }
  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).json({ error: "Not authenticated." });

  const token = req.body?.token;
  if (typeof token !== "string" || !/^[0-9a-f-]{36}$/i.test(token)) {
    return res.status(400).json({ error: "Invalid invite link." });
  }
  const group = await joinGroupByInvite(token, Number(session.user.id));
  if (!group) return res.status(404).json({ error: "This invite link is no longer valid." });
  return res.status(200).json({ group: { id: group.id, name: group.name } });
}
