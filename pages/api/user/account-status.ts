import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";

import { getAccountStatus } from "../../../src/data/emailVerification";
import { authOptions } from "../auth/[...nextauth]";

// GET — what the navbar and verify-email banner need about the signed-in user, in one request.
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ error: "Method not allowed." });
  }
  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).json({ error: "Not authenticated." });
  res.setHeader("Cache-Control", "private, no-store");
  return res.status(200).json(await getAccountStatus(Number(session.user.id)));
}
