import { NextApiRequest, NextApiResponse } from "next";

import { siteSearch } from "../../src/data/search";

// GET /api/search?q=... — the navbar's search across shows, theatres, people and members.
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ error: "Method not allowed." });
  }
  const q = typeof req.query.q === "string" ? req.query.q.slice(0, 100) : "";
  try {
    res.setHeader("Cache-Control", "public, max-age=30, stale-while-revalidate=60");
    return res.status(200).json({ results: await siteSearch(q) });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error." });
  }
}
