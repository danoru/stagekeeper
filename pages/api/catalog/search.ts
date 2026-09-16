import { NextApiRequest, NextApiResponse } from "next";

import { searchShows, searchTheatres } from "../../../src/data/catalog";

// GET /api/catalog/search?q=...&kind=shows|theatres
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ error: "Method not allowed." });
  }
  const q = typeof req.query.q === "string" ? req.query.q.slice(0, 100) : "";
  const kind = req.query.kind === "theatres" ? "theatres" : "shows";
  const results = kind === "theatres" ? await searchTheatres(q) : await searchShows(q);
  res.setHeader("Cache-Control", "private, no-store");
  return res.status(200).json({ results });
}
