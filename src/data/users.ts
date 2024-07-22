import prisma from "./db";

export function getUsers() {
  const users = prisma.users.findMany({
    orderBy: { username: "asc" },
  });
  return users;
}

export async function getUserProfile(username: string) {
  const user = await prisma.users.findUnique({
    where: {
      username,
    },
    include: {
      watchlist: { include: { musicals: true } },
      attendance: {
        include: { performances: true, users: true },
        orderBy: { performances: { startTime: "desc" } },
      },
      following: true,
    },
  });
  return user;
}

export async function findUserByUsername(username: string) {
  const user = await prisma.users.findUnique({
    where: {
      username,
    },
  });
  return user;
}

export async function getFollowers(username: string) {
  const followers = await prisma.following.findMany({
    where: {
      followingUsername: username,
    },
    include: {
      users: true,
    },
  });
  return followers;
}

export async function getFollowing(user: number) {
  const following = await prisma.following.findMany({
    where: {
      user,
    },
    include: {
      users: true,
    },
  });

  return following;
}

export async function followUser(userId: number, followingUsername: string) {
  try {
    await fetch("/api/user/follow", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId,
        followingUsername,
        action: "follow",
      }),
    });
  } catch (error) {
    console.error("Failed to follow user:", error);
  }
}

export async function unfollowUser(userId: number, followingUsername: string) {
  try {
    await fetch("/api/user/follow", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId,
        followingUsername,
        action: "unfollow",
      }),
    });
  } catch (error) {
    console.error("Failed to unfollow user:", error);
  }
}

export async function getUserAttendance(id: number) {
  const attendance = await prisma.attendance.findUnique({
    where: {
      id,
    },
    include: {
      performances: { include: { musicals: true } },
    },
  });
  return attendance;
}

export async function getUserLikes(username: string) {
  const user = await prisma.users.findUnique({
    where: {
      username,
    },
    include: {
      likedMusicals: {
        include: {
          musicals: true,
        },
      },
    },
  });
  return user;
}
