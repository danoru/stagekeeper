import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";

import { sendVerificationEmail } from "../../../src/data/emailVerification";
import { rateLimit } from "../../../src/utils/rateLimit";
import { authOptions } from "../auth/[...nextauth]";

// POST — send the signed-in user a new verification link.
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: "Method not allowed." });
  }
  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).json({ error: "Not authenticated." });
  const userId = Number(session.user.id);

  if (!(await rateLimit(`resend-verification:${userId}`, 3, 15 * 60 * 1000))) {
    return res.status(429).json({ error: "We just sent one. Try again in a few minutes." });
  }
  const sent = await sendVerificationEmail(userId, req);
  if (!sent) return res.status(502).json({ error: "Couldn't send the email. Try again later." });
  return res.status(200).json({ message: "Sent." });
}
