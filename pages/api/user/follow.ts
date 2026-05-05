import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";

import { authOptions } from "../auth/[...nextauth]";
import prisma from "../../../src/data/db";

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

  try {
    if (action === "follow") {
      await prisma.following.create({
        data: { user: userId, followingUsername },
      });
      return res.status(200).json({ message: "Successfully followed user." });
    }
    if (action === "unfollow") {
      await prisma.following.delete({
        where: {
          user_followingUsername: { user: userId, followingUsername },
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
