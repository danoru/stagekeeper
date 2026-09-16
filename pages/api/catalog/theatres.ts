import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";

import { createUserTheatre } from "../../../src/data/catalog";
import { clientIp, rateLimit } from "../../../src/utils/rateLimit";
import { authOptions } from "../auth/[...nextauth]";

// POST /api/catalog/theatres — any signed-in user can add a theatre (lands as PENDING).
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: "Method not allowed." });
  }
  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).json({ error: "Not authenticated." });
  if (!rateLimit(`create-theatre:${clientIp(req)}`, 30, 60 * 60 * 1000)) {
    return res.status(429).json({ error: "Slow down — too many new theatres at once." });
  }

  const { name, location } = req.body ?? {};
  if (typeof name !== "string" || name.trim().length < 2 || name.trim().length > 120) {
    return res.status(400).json({ error: "Name must be between 2 and 120 characters." });
  }
  if (typeof location !== "string" || location.trim().length > 120) {
    return res.status(400).json({ error: "Location must be 120 characters or fewer." });
  }

  try {
    const result = await createUserTheatre({
      name,
      location,
      createdBy: Number(session.user.id),
    });
    if (result.created) await res.revalidate("/theatres").catch(() => undefined);
    return res
      .status(result.created ? 201 : 200)
      .json({ theatre: result.theatre, created: result.created });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Failed to add theatre." });
  }
}
