import type { NextApiRequest, NextApiResponse } from "next";

import { getPaginatedPlays } from "../../../src/data/plays";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { page = "1", limit = "10" } = req.query;
  const pageNumber = parseInt(Array.isArray(page) ? page[0] : page, 10);
  const limitNumber = parseInt(Array.isArray(limit) ? limit[0] : limit, 10);

  const { plays, playCount } = await getPaginatedPlays(pageNumber, limitNumber);

  res.setHeader("Cache-Control", "public, max-age=60, stale-while-revalidate=30");
  res.status(200).json({ plays, playCount });
}
