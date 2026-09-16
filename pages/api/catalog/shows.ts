import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";

import { createUserShow } from "../../../src/data/catalog";
import { clientIp, rateLimit } from "../../../src/utils/rateLimit";
import { authOptions } from "../auth/[...nextauth]";

// POST /api/catalog/shows — any signed-in user can add a show (lands as PENDING).
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: "Method not allowed." });
  }
  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).json({ error: "Not authenticated." });
  if (!rateLimit(`create-show:${clientIp(req)}`, 30, 60 * 60 * 1000)) {
    return res.status(429).json({ error: "Slow down — too many new shows at once." });
  }

  const { type, title, premiereYear } = req.body ?? {};
  if (type !== "MUSICAL" && type !== "PLAY") {
    return res.status(400).json({ error: "type must be MUSICAL or PLAY." });
  }
  if (typeof title !== "string" || title.trim().length < 2 || title.trim().length > 120) {
    return res.status(400).json({ error: "Title must be between 2 and 120 characters." });
  }
  let year: number | null = null;
  if (premiereYear != null && premiereYear !== "") {
    year = Number(premiereYear);
    if (!Number.isInteger(year) || year < 1500 || year > new Date().getFullYear() + 2) {
      return res.status(400).json({ error: "Enter a valid premiere year." });
    }
  }

  try {
    const result = await createUserShow({
      type,
      title,
      premiereYear: year,
      createdBy: Number(session.user.id),
    });
    if (result.created) {
      // Static list pages would otherwise hide the new show until their next revalidation.
      const listPath = type === "MUSICAL" ? "/musicals" : "/plays";
      await res.revalidate(listPath).catch(() => undefined);
    }
    return res.status(result.created ? 201 : 200).json({
      show: { ...result.show, type: result.type },
      created: result.created,
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Failed to add show." });
  }
}
