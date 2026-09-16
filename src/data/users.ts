import { Prisma } from "@prisma/client";

import prisma from "./db";

// The only user columns that may ever reach the client. Never `include: { users: true }`
// on a query whose result is serialized into page props — that ships password hashes.
export const publicUserSelect = {
  id: true,
  username: true,
  firstName: true,
  lastName: true,
  location: true,
  website: true,
  bio: true,
  image: true,
  badge: true,
  createdAt: true,
  onboardedAt: true,
} satisfies Prisma.usersSelect;

export type PublicUser = Prisma.usersGetPayload<{ select: typeof publicUserSelect }>;

export function getUsers() {
  const users = prisma.users.findMany({
    orderBy: { username: "asc" },
    select: publicUserSelect,
  });
  return users;
}

export async function getUserProfile(username: string, viewerId?: number) {
  const user = await prisma.users.findUnique({
    where: { username },
    select: {
      id: true,
      username: true,
      firstName: true,
      lastName: true,
      location: true,
      website: true,
      bio: true,
      image: true,
      badge: true,
      createdAt: true,
    },
  });

  if (!user) return null;

  const currentYear = new Date().getUTCFullYear();
  const yearStart = new Date(Date.UTC(currentYear, 0, 1));
  const yearEnd = new Date(Date.UTC(currentYear + 1, 0, 1));
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  // "Going" rows only count once the date has passed.
  const attended = { OR: [{ going: false }, { seenDate: { lt: today } }] };

  const [
    musicalsAttended,
    playsAttended,
    attendanceThisYear,
    following,
    followersCount,
    viewerFollow,
    watchlistPreview,
    watchlistTotal,
  ] = await Promise.all([
    prisma.attendance.count({
      where: {
        user: user.id,
        AND: [
          attended,
          { OR: [{ performances: { type: "MUSICAL" } }, { musical: { not: null } }] },
        ],
      },
    }),
    prisma.attendance.count({
      where: {
        user: user.id,
        AND: [attended, { OR: [{ performances: { type: "PLAY" } }, { play: { not: null } }] }],
      },
    }),
    prisma.attendance.count({
      where: {
        user: user.id,
        AND: [
          attended,
          {
            OR: [
              { performances: { startTime: { gte: yearStart, lt: yearEnd } } },
              { seenDate: { gte: yearStart, lt: yearEnd } },
            ],
          },
        ],
      },
    }),
    prisma.following.findMany({
      where: { user: user.id },
      orderBy: { followingUsername: "asc" },
    }),
    prisma.following.count({
      where: { followingUsername: { equals: user.username, mode: "insensitive" } },
    }),
    viewerId
      ? prisma.following.findFirst({
          where: {
            user: viewerId,
            followingUsername: { equals: user.username, mode: "insensitive" },
          },
        })
      : Promise.resolve(null),
    prisma.watchlist.findMany({
      where: { user: user.id },
      include: { musicals: true, plays: true },
      orderBy: { createdAt: "desc" },
      take: 4,
    }),
    prisma.watchlist.count({ where: { user: user.id } }),
  ]);

  return {
    user,
    following,
    followersCount,
    isFollowedByViewer: viewerFollow !== null,
    attendanceStats: { musicalsAttended, playsAttended, attendanceThisYear },
    watchlistPreview,
    watchlistTotal,
  };
}

export async function findUserByUsername(username: string) {
  const user = await prisma.users.findUnique({
    where: {
      username,
    },
    select: publicUserSelect,
  });
  return user;
}

export async function findUserByUserId(id: number) {
  const user = await prisma.users.findUnique({
    where: {
      id,
    },
    select: publicUserSelect,
  });
  return user;
}

export async function getFollowers(username: string) {
  const followers = await prisma.following.findMany({
    where: {
      followingUsername: { equals: username, mode: "insensitive" },
    },
    include: {
      users: { select: publicUserSelect },
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
      users: { select: publicUserSelect },
    },
    orderBy: { users: { username: "asc" } },
  });

  return following;
}

export async function followUser(followingUsername: string) {
  try {
    await fetch("/api/user/follow", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        followingUsername,
        action: "follow",
      }),
    });
  } catch (error) {
    console.error("Failed to follow user:", error);
  }
}

export async function unfollowUser(followingUsername: string) {
  try {
    await fetch("/api/user/follow", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        followingUsername,
        action: "unfollow",
      }),
    });
  } catch (error) {
    console.error("Failed to unfollow user:", error);
  }
}

export async function getDistinctYears() {
  const rows = await prisma.$queryRaw<{ year: number }[]>`
    SELECT DISTINCT EXTRACT(YEAR FROM d)::int AS year
    FROM (
      SELECT "seenDate"::timestamptz AS d FROM "attendance" WHERE "seenDate" IS NOT NULL
      UNION ALL
      SELECT p."startTime" FROM "attendance" a JOIN "performances" p ON p.id = a."performance"
    ) dates
    ORDER BY year DESC
  `;
  return rows.map((r) => r.year);
}

export async function getUserLikes(username: string) {
  const user = await prisma.users.findUnique({
    where: {
      username,
    },
    select: {
      ...publicUserSelect,
      likedShows: {
        include: {
          musicals: true,
          plays: true,
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });
  return user;
}
