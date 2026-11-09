import { Prisma } from "@prisma/client";

import { theatreToday, visitDay } from "../utils/schedule";

import prisma from "./db";
import { visibleAttendance, visibleLikes, visibleWatchlist } from "./visibility";

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

// The public member list: usernames only. Names, locations and bios stay on each person's profile.
export function getMemberDirectory() {
  return prisma.users.findMany({
    where: { username: { not: "guest" } },
    orderBy: { username: "asc" },
    select: { username: true, image: true, badge: true },
  });
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

  const today = theatreToday();

  const [viewings, following, followersCount, viewerFollow, watchlistPreview, watchlistTotal] =
    await Promise.all([
      // "Going" rows only count once the date has passed.
      prisma.attendance.findMany({
        where: {
          user: user.id,
          AND: [
            visibleAttendance(viewerId ?? null),
            { OR: [{ going: false }, { seenDate: { lt: today } }] },
          ],
        },
        select: {
          musical: true,
          play: true,
          seenDate: true,
          performances: { select: { musical: true, play: true, startTime: true } },
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
        where: { user: user.id, AND: [visibleWatchlist(viewerId ?? null)] },
        select: {
          id: true,
          type: true,
          musicals: { select: { title: true, playbill: true } },
          plays: { select: { title: true, playbill: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 4,
      }),
      prisma.watchlist.count({
        where: { user: user.id, AND: [visibleWatchlist(viewerId ?? null)] },
      }),
    ]);

  // Musicals and Plays count different shows, matching the lists they link to. Seeing one show
  // twice counts once there, and twice in "This Year", which counts nights out.
  const musicals = new Set<number>();
  const plays = new Set<number>();
  let attendanceThisYear = 0;
  for (const row of viewings) {
    const musical = row.musical ?? row.performances?.musical;
    const play = row.play ?? row.performances?.play;
    if (musical) musicals.add(musical);
    if (play) plays.add(play);
    const date = visitDay(row.seenDate, row.performances?.startTime);
    if (date?.getUTCFullYear() === today.getUTCFullYear()) attendanceThisYear++;
  }

  return {
    user,
    following,
    followersCount,
    isFollowedByViewer: viewerFollow !== null,
    attendanceStats: {
      musicalsAttended: musicals.size,
      playsAttended: plays.size,
      attendanceThisYear,
    },
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

export async function getUserLikes(username: string, viewerId: number | null) {
  const user = await prisma.users.findUnique({
    where: {
      username,
    },
    select: {
      ...publicUserSelect,
      likedShows: {
        where: visibleLikes(viewerId),
        select: {
          type: true,
          musicals: { select: { id: true, title: true, playbill: true } },
          plays: { select: { id: true, title: true, playbill: true } },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });
  return user;
}
