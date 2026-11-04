import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";

import { getVerificationStatus, sendVerificationEmail } from "../../../src/data/emailVerification";
import { rateLimit } from "../../../src/utils/rateLimit";
import { authOptions } from "../auth/[...nextauth]";

// The signed-in user's verification state.
//   GET  → { required, verified, email }
//   POST → send a new link
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).json({ error: "Not authenticated." });
  const userId = Number(session.user.id);

  if (req.method === "GET") {
    res.setHeader("Cache-Control", "private, no-store");
    return res.status(200).json(await getVerificationStatus(userId));
  }

  if (req.method === "POST") {
    if (!(await rateLimit(`resend-verification:${userId}`, 3, 15 * 60 * 1000))) {
      return res.status(429).json({ error: "We just sent one. Try again in a few minutes." });
    }
    const sent = await sendVerificationEmail(userId, req);
    if (!sent) return res.status(502).json({ error: "Couldn't send the email. Try again later." });
    return res.status(200).json({ message: "Sent." });
  }

  res.setHeader("Allow", ["GET", "POST"]);
  return res.status(405).json({ error: "Method not allowed." });
}
