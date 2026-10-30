import { NextApiRequest, NextApiResponse } from "next";

import { searchPeople } from "../../../src/data/people";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ error: "Method not allowed." });
  }
  const q = typeof req.query.q === "string" ? req.query.q.slice(0, 80) : "";
  try {
    res.setHeader("Cache-Control", "public, max-age=30, stale-while-revalidate=60");
    return res.status(200).json(await searchPeople(q));
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error." });
  }
}
