import prisma from "../../../src/data/db";
import { NextApiRequest, NextApiResponse } from "next";

export async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { user, followingUsername, action } = req.body;

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed." });
  }

  try {
    if (action === "follow") {
      await prisma.following.create({
        data: {
          user,
          followingUsername,
        },
      });
      res.status(200).json({ message: "Successfully followed user." });
    } else if (action === "unfollow") {
      await prisma.following.delete({
        where: {
          user_followingUsername: {
            user,
            followingUsername,
          },
        },
      });
      res.status(200).json({ message: "Successfully unfollowed user." });
    }
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to update follow status." });
  } finally {
    await prisma.$disconnect();
  }
}
