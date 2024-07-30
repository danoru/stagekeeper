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

export async function findUserByUserId(id: number) {
  const user = await prisma.users.findUnique({
    where: {
      id,
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
    orderBy: { users: { username: "asc" } },
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
    orderBy: { users: { username: "asc" } },
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
  const attendance = await prisma.attendance.findMany({
    where: { user: id },
    orderBy: { performances: { musicals: { title: "asc" } } },
    include: {
      performances: { include: { musicals: true, theatres: true } },
    },
  });
  return attendance;
}

export async function getUserAttendanceByYear(year: number | null, id: number) {
  let dateFilter = {};

  if (year) {
    const startOfYear = new Date(year, 0, 1);
    const endOfYear = new Date(year + 1, 0, 1);
    dateFilter = {
      startTime: {
        gte: startOfYear,
        lt: endOfYear,
      },
    };
  }

  const attendance = await prisma.attendance.findMany({
    where: {
      user: id,

      performances: dateFilter,
    },
    orderBy: { performances: { startTime: "asc" } },
    include: {
      performances: { include: { musicals: true, theatres: true } },
    },
  });
  return attendance;
}

export async function getDistinctYears() {
  const performances = await prisma.performances.findMany({
    select: {
      startTime: true,
    },
  });

  const years = performances
    .map((performance) => new Date(performance.startTime).getFullYear())
    .filter((year, index, self) => self.indexOf(year) === index);
  return years;
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
        orderBy: { musicals: { title: "asc" } },
      },
    },
  });
  return user;
}
