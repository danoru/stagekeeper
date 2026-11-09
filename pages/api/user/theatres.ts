import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";

import {
  addHomeTheatre,
  getHomeTheatreIds,
  HOME_THEATRE_LIMIT,
  removeHomeTheatre,
} from "../../../src/data/homeTheatres";
import { authOptions } from "../auth/[...nextauth]";

// The signed-in member's home theatres.
//   GET            → { ids: number[] } (empty when signed out, so cached theatre pages can ask)
//   POST   { theatreId } → add one
//   DELETE { theatreId } → remove one
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);

  if (req.method === "GET") {
    res.setHeader("Cache-Control", "private, no-store");
    if (!session) return res.status(200).json({ ids: [] });
    return res.status(200).json({ ids: await getHomeTheatreIds(Number(session.user.id)) });
  }

  if (req.method !== "POST" && req.method !== "DELETE") {
    res.setHeader("Allow", ["GET", "POST", "DELETE"]);
    return res.status(405).json({ error: "Method not allowed." });
  }
  if (!session) return res.status(401).json({ error: "Not authenticated." });

  const userId = Number(session.user.id);
  const theatreId = Number(req.body?.theatreId);
  if (!Number.isInteger(theatreId) || theatreId <= 0) {
    return res.status(400).json({ error: "theatreId must be a positive integer." });
  }

  try {
    if (req.method === "POST") {
      const result = await addHomeTheatre(userId, theatreId, {
        id: userId,
        isAdmin: session.user.badge === "ADMIN",
      });
      if (result === "not-found") return res.status(404).json({ error: "Theatre not found." });
      if (result === "limit") {
        return res
          .status(400)
          .json({ error: `You can have up to ${HOME_THEATRE_LIMIT} home theatres.` });
      }
      return res.status(200).json({ message: "Added to your theatres." });
    }
    await removeHomeTheatre(userId, theatreId);
    return res.status(200).json({ message: "Removed from your theatres." });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to update your theatres." });
  }
}
