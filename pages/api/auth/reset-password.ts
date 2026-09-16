import { hash } from "bcrypt";
import { NextApiRequest, NextApiResponse } from "next";

import prisma from "../../../src/data/db";
import { clientIp, rateLimit } from "../../../src/utils/rateLimit";
import { hashResetToken } from "../../../src/utils/resetToken";
import { PASSWORD_MIN_LENGTH } from "../../../src/utils/validation";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: "Method not allowed." });
  }

  if (!rateLimit(`reset:${clientIp(req)}`, 10, 15 * 60 * 1000)) {
    return res.status(429).json({ error: "Too many attempts. Try again in a few minutes." });
  }

  const { token, password } = req.body ?? {};
  if (typeof token !== "string" || token.length < 32) {
    return res.status(400).json({ error: "Invalid reset link." });
  }
  if (typeof password !== "string" || password.length < PASSWORD_MIN_LENGTH) {
    return res
      .status(400)
      .json({ error: `Password must be at least ${PASSWORD_MIN_LENGTH} characters long.` });
  }

  const user = await prisma.users.findUnique({
    where: { passwordResetToken: hashResetToken(token) },
    select: { id: true, passwordResetExpires: true },
  });
  if (!user || !user.passwordResetExpires || user.passwordResetExpires < new Date()) {
    return res.status(400).json({ error: "This reset link is invalid or has expired." });
  }

  await prisma.users.update({
    where: { id: user.id },
    data: {
      password: await hash(password, 10),
      passwordResetToken: null,
      passwordResetExpires: null,
    },
  });

  return res.status(200).json({ message: "Password updated." });
}
