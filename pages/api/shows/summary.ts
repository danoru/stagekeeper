import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";

import { getShowSummary } from "../../../src/data/showSummary";
import { authOptions } from "../auth/[...nextauth]";

function parseId(raw: unknown): number | null {
  const n = Number(raw);
  return typeof raw === "string" && Number.isInteger(n) && n > 0 ? n : null;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ error: "Method not allowed." });
  }

  const musicalId = parseId(req.query.musicalId);
  const playId = parseId(req.query.playId);
  if (!musicalId && !playId) {
    return res.status(400).json({ error: "musicalId or playId is required." });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    const summary = await getShowSummary(
      musicalId ? { musical: musicalId } : { play: playId! },
      session ? Number(session.user.id) : null
    );
    res.setHeader("Cache-Control", "private, no-store");
    return res.status(200).json(summary);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error." });
  }
}
