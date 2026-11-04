import { NextApiRequest, NextApiResponse } from "next";

import { confirmEmail } from "../../../src/data/emailVerification";
import { clientIp, rateLimit } from "../../../src/utils/rateLimit";

// POST { token } — the link in a verification email. No session needed: people often open it
// on a different device from the one they signed up on.
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: "Method not allowed." });
  }
  if (!(await rateLimit(`verify-email:${clientIp(req)}`, 20, 15 * 60 * 1000))) {
    return res.status(429).json({ error: "Too many attempts. Try again in a few minutes." });
  }
  const token = req.body?.token;
  if (typeof token !== "string" || token.length < 32) {
    return res.status(400).json({ error: "Invalid link." });
  }
  if (!(await confirmEmail(token))) {
    return res.status(400).json({ error: "This link is invalid or has expired." });
  }
  return res.status(200).json({ message: "Email confirmed." });
}
