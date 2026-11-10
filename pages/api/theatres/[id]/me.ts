import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";

import { getViewerHouse } from "../../../../src/data/houseRecord";
import { authOptions } from "../../auth/[...nextauth]";

// GET → the signed-in member's side of a theatre page (their nights there, note votes).
// Fetched by the page itself, since the page is cached for everyone.
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ error: "Method not allowed." });
  }
  res.setHeader("Cache-Control", "private, no-store");
  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(200).json({ house: null });
  const theatreId = Number(req.query.id);
  if (!Number.isInteger(theatreId)) return res.status(400).json({ error: "Invalid theatre." });
  return res.status(200).json({ house: await getViewerHouse(theatreId, Number(session.user.id)) });
}
