import { randomBytes } from "crypto";

import { NextApiRequest, NextApiResponse } from "next";

import prisma from "../../../src/data/db";
import { sendMail } from "../../../src/utils/mail";
import { clientIp, rateLimit } from "../../../src/utils/rateLimit";
import { hashResetToken } from "../../../src/utils/resetToken";

const TOKEN_TTL_MS = 60 * 60 * 1000;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: "Method not allowed." });
  }

  const ip = clientIp(req);
  if (!rateLimit(`forgot:${ip}`, 5, 15 * 60 * 1000)) {
    return res.status(429).json({ error: "Too many requests. Try again in a few minutes." });
  }

  const identifier = typeof req.body?.identifier === "string" ? req.body.identifier.trim() : "";
  if (!identifier) {
    return res.status(400).json({ error: "Enter your username or email." });
  }

  // Always answer the same way so the endpoint can't be used to probe for accounts.
  const generic = { message: "If that account exists, a reset link is on its way." };

  const user = await prisma.users.findFirst({
    where: { OR: [{ username: identifier }, { email: identifier }] },
    select: { id: true, email: true, username: true },
  });
  if (!user) return res.status(200).json(generic);

  const token = randomBytes(32).toString("hex");
  await prisma.users.update({
    where: { id: user.id },
    data: {
      passwordResetToken: hashResetToken(token),
      passwordResetExpires: new Date(Date.now() + TOKEN_TTL_MS),
    },
  });

  const base = process.env.NEXTAUTH_URL ?? `http://${req.headers.host}`;
  const link = `${base}/reset-password?token=${token}`;
  try {
    await sendMail({
      to: user.email,
      subject: "Reset your StageKeeper password",
      text: `Hi ${user.username},\n\nReset your password here (link expires in an hour):\n${link}\n\nIf you didn't ask for this, ignore this email.`,
      html: `<p>Hi ${user.username},</p><p><a href="${link}">Reset your password</a> (link expires in an hour).</p><p>If you didn't ask for this, ignore this email.</p>`,
    });
  } catch (e) {
    console.error("Failed to send reset email:", e);
  }

  return res.status(200).json(generic);
}
