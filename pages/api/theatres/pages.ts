import type { NextApiRequest, NextApiResponse } from "next";
import { getPaginatedTheatres } from "../../../src/data/theatres";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { page = "1", limit = "10" } = req.query;
  const pageNumber = parseInt(Array.isArray(page) ? page[0] : page, 10);
  const limitNumber = parseInt(Array.isArray(limit) ? limit[0] : limit, 10);

  const { theatres, theatreCount } = await getPaginatedTheatres(
    pageNumber,
    limitNumber
  );

  res.status(200).json({ theatres, theatreCount });
}
