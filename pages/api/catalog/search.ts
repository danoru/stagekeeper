import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";

import { searchShows, searchTheatres } from "../../../src/data/catalog";
import { authOptions } from "../auth/[...nextauth]";

// GET /api/catalog/search?q=...&kind=shows|theatres
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ error: "Method not allowed." });
  }
  const q = typeof req.query.q === "string" ? req.query.q.slice(0, 100) : "";
  const kind = req.query.kind === "theatres" ? "theatres" : "shows";
  // Pending entries only reach the people allowed to see them, so results vary by viewer.
  const session = await getServerSession(req, res, authOptions);
  const viewer = {
    id: session ? Number(session.user.id) : null,
    isAdmin: session?.user.badge === "ADMIN",
  };
  const results =
    kind === "theatres" ? await searchTheatres(q, 10, viewer) : await searchShows(q, 10, viewer);
  res.setHeader("Cache-Control", "private, no-store");
  return res.status(200).json({ results });
}
