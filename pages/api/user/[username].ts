import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";

import { authOptions } from "../auth/[...nextauth]";
import prisma from "../../../src/data/db";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { username } = req.query;

  if (req.method === "GET") {
    try {
      const user = await prisma.users.findUnique({
        where: { username: String(username) },
        select: {
          id: true,
          username: true,
          firstName: true,
          lastName: true,
          image: true,
        },
      });
      res.setHeader("Cache-Control", "public, max-age=60, stale-while-revalidate=120");
      return res.status(200).json(user);
    } catch (error) {
      return res.status(500).json({ message: "Error fetching user data." });
    }
  }

  if (req.method === "PUT") {
    const session = await getServerSession(req, res, authOptions);
    if (!session) {
      return res.status(401).json({ error: "Not authenticated." });
    }
    if (session.user.username.toLowerCase() !== String(username).toLowerCase()) {
      return res.status(403).json({ error: "Forbidden." });
    }

    const { firstName, lastName, email, location, website, bio } = req.body;

    try {
      const updatedUser = await prisma.users.update({
        where: { id: Number(session.user.id) },
        data: { firstName, lastName, email, location, website, bio },
      });
      return res.status(200).json(updatedUser);
    } catch (error) {
      return res.status(500).json({ message: "Error updating user data." });
    }
  }

  res.setHeader("Allow", ["GET", "PUT"]);
  return res.status(405).json({ error: `Method ${req.method} is not allowed.` });
}

export default handler;
