import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";

import { getUpcomingProgrammingForPicker, isGroupMember } from "../../../../src/data/groups";
import { authOptions } from "../../auth/[...nextauth]";

// GET — the runs and showtimes the propose-a-show form picks from. Loaded when the form opens
// rather than with the group page, because it's by far the largest thing the page would carry.
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ error: "Method not allowed." });
  }
  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).json({ error: "Not authenticated." });

  const groupId = Number(req.query.id);
  if (!Number.isInteger(groupId) || !(await isGroupMember(groupId, Number(session.user.id)))) {
    return res.status(404).json({ error: "Group not found." });
  }
  res.setHeader("Cache-Control", "private, max-age=60");
  return res.status(200).json(await getUpcomingProgrammingForPicker());
}
