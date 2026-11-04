import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";

import prisma from "../../../src/data/db";
import { getOpenReports } from "../../../src/data/reports";
import { authOptions } from "../auth/[...nextauth]";

// Admin queue for member reports.
//   GET            → open reports
//   PATCH { id }   → mark one handled
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session || session.user.badge !== "ADMIN") {
    return res.status(403).json({ error: "Forbidden." });
  }

  if (req.method === "GET") {
    return res.status(200).json(await getOpenReports());
  }

  if (req.method === "PATCH") {
    const id = Number(req.body?.id);
    if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ error: "id is required." });
    await prisma.reports.updateMany({ where: { id }, data: { resolvedAt: new Date() } });
    return res.status(200).json({ message: "Marked as handled." });
  }

  res.setHeader("Allow", ["GET", "PATCH"]);
  return res.status(405).json({ error: `Method ${req.method} not allowed.` });
}
