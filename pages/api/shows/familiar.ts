import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";

import { getFamiliarFaces } from "../../../src/data/familiarFaces";
import { authOptions } from "../auth/[...nextauth]";

// GET ?musicalId= | ?playId= → { faces: { [programmingId]: FamiliarFace[] } } for the viewer.
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ error: "Method not allowed." });
  }
  res.setHeader("Cache-Control", "private, no-store");
  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(200).json({ faces: {} });
  const musicalId = Number(req.query.musicalId);
  const playId = Number(req.query.playId);
  const show =
    Number.isInteger(musicalId) && musicalId > 0
      ? { musical: musicalId }
      : Number.isInteger(playId) && playId > 0
        ? { play: playId }
        : null;
  if (!show) return res.status(400).json({ error: "musicalId or playId is required." });
  return res.status(200).json({ faces: await getFamiliarFaces(Number(session.user.id), show) });
}
