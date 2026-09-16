import { compare, hash } from "bcrypt";
import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";

import prisma from "../../../src/data/db";
import { PASSWORD_MIN_LENGTH } from "../../../src/utils/validation";
import { authOptions } from "../auth/[...nextauth]";

// Self-serve password change for the signed-in user.
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "PATCH") {
    res.setHeader("Allow", ["PATCH"]);
    return res.status(405).json({ error: "Method not allowed." });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).json({ error: "Not authenticated." });

  const { currentPassword, newPassword } = req.body ?? {};
  if (typeof currentPassword !== "string" || typeof newPassword !== "string") {
    return res.status(400).json({ error: "Current and new password are required." });
  }
  if (newPassword.length < PASSWORD_MIN_LENGTH) {
    return res
      .status(400)
      .json({ error: `New password must be at least ${PASSWORD_MIN_LENGTH} characters long.` });
  }

  const user = await prisma.users.findUnique({
    where: { id: Number(session.user.id) },
    select: { id: true, password: true },
  });
  if (!user || !(await compare(currentPassword, user.password))) {
    return res.status(400).json({ error: "Current password is incorrect." });
  }

  await prisma.users.update({
    where: { id: user.id },
    data: { password: await hash(newPassword, 10) },
  });
  return res.status(200).json({ message: "Password updated." });
}
