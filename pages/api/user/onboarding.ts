import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";

import prisma from "../../../src/data/db";
import { authOptions } from "../auth/[...nextauth]";

// POST → mark the signed-in user as having finished (or skipped) onboarding.
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: "Method not allowed." });
  }
  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).json({ error: "Not authenticated." });

  await prisma.users.update({
    where: { id: Number(session.user.id) },
    data: { onboardedAt: new Date() },
  });
  return res.status(200).json({ message: "Done." });
}
