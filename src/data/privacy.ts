import type { Prisma } from "@prisma/client";

import { theatreToday } from "../utils/schedule";

import prisma from "./db";

// Profiles and past viewings are public. Future "going" dates say where someone will be on a
// given night, so only the person and their mutual follows (each follows the other) see them.

/** Ids of people the viewer follows who follow the viewer back. */
export async function getMutualFollowIds(viewerId: number): Promise<Set<number>> {
  const [me, following] = await Promise.all([
    prisma.users.findUnique({ where: { id: viewerId }, select: { username: true } }),
    prisma.following.findMany({ where: { user: viewerId }, select: { followingUsername: true } }),
  ]);
  if (!me || following.length === 0) return new Set();

  const mutual = await prisma.users.findMany({
    where: {
      username: { in: following.map((f) => f.followingUsername) },
      following: { some: { followingUsername: { equals: me.username, mode: "insensitive" } } },
    },
    select: { id: true },
  });
  return new Set(mutual.map((u) => u.id));
}

/** Whether `viewerId` may see `ownerId`'s upcoming "going" dates. */
export async function canSeeGoingDates(viewerId: number | null, ownerId: number) {
  if (viewerId == null) return false;
  if (viewerId === ownerId) return true;
  return (await getMutualFollowIds(viewerId)).has(ownerId);
}

/** Excludes upcoming "going" rows except for the users in `visibleTo`. */
export function hideGoingExcept(visibleTo: number[]): Prisma.attendanceWhereInput {
  return {
    OR: [
      { going: false },
      { seenDate: { lt: theatreToday() } },
      ...(visibleTo.length ? [{ user: { in: visibleTo } }] : []),
    ],
  };
}
