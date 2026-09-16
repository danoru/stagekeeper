import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";

import prisma from "../../../src/data/db";
import { authOptions } from "../auth/[...nextauth]";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: "Method not allowed." });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ error: "Not authenticated." });
  }

  const userId = Number(session.user.id);
  const { followingUsername, action } = req.body;

  if (!followingUsername || typeof followingUsername !== "string") {
    return res.status(400).json({ error: "followingUsername is required." });
  }

  if (followingUsername.toLowerCase() === session.user.username.toLowerCase()) {
    return res.status(400).json({ error: "Cannot follow yourself." });
  }

  // Resolve to the canonical username so "bob" and "Bob" are the same follow.
  const target = await prisma.users.findUnique({
    where: { username: followingUsername },
    select: { username: true },
  });
  if (!target) {
    return res.status(404).json({ error: "User not found." });
  }

  try {
    if (action === "follow") {
      await prisma.following.upsert({
        where: {
          user_followingUsername: { user: userId, followingUsername: target.username },
        },
        create: { user: userId, followingUsername: target.username },
        update: {},
      });
      return res.status(200).json({ message: "Successfully followed user." });
    }
    if (action === "unfollow") {
      await prisma.following.deleteMany({
        where: {
          user: userId,
          followingUsername: { equals: target.username, mode: "insensitive" },
        },
      });
      return res.status(200).json({ message: "Successfully unfollowed user." });
    }
    return res.status(400).json({ error: "Invalid action." });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Failed to update follow status." });
  }
}
