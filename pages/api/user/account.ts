import { compare } from "bcrypt";
import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";

import { deleteAccount, exportAccountData } from "../../../src/data/account";
import prisma from "../../../src/data/db";
import { rateLimit } from "../../../src/utils/rateLimit";
import { authOptions } from "../auth/[...nextauth]";

// The signed-in user's own account.
//   GET              → download everything tied to it as JSON
//   DELETE { password } → delete it
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).json({ error: "Not authenticated." });
  const userId = Number(session.user.id);

  if (req.method === "GET") {
    if (!(await rateLimit(`export:${userId}`, 5, 60 * 60 * 1000))) {
      return res.status(429).json({ error: "Too many exports. Try again later." });
    }
    const data = await exportAccountData(userId);
    if (!data) return res.status(404).json({ error: "Account not found." });
    res.setHeader("Cache-Control", "private, no-store");
    res.setHeader("Content-Disposition", 'attachment; filename="stagekeeper-export.json"');
    return res.status(200).json(data);
  }

  if (req.method === "DELETE") {
    if (!(await rateLimit(`delete-account:${userId}`, 5, 15 * 60 * 1000))) {
      return res.status(429).json({ error: "Too many attempts. Try again in a few minutes." });
    }
    const password = req.body?.password;
    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: { password: true },
    });
    if (typeof password !== "string" || !user || !(await compare(password, user.password))) {
      return res.status(400).json({ error: "That password is incorrect." });
    }
    try {
      await deleteAccount(userId);
      return res.status(200).json({ message: "Account deleted." });
    } catch (error) {
      console.error("Account deletion failed:", error);
      return res.status(500).json({ error: "Couldn't delete the account. Nothing was changed." });
    }
  }

  res.setHeader("Allow", ["GET", "DELETE"]);
  return res.status(405).json({ error: "Method not allowed." });
}
