import prisma from "./db";

// Profiles and past viewings are public. Future "going" dates say where someone will be on a
// given night, so only the person, their mutual follows (each follows the other) and people
// who share a group with them see them.

async function getFollowedIds(viewerId: number) {
  const following = await prisma.following.findMany({
    where: { user: viewerId },
    select: { followingUsername: true },
  });
  if (following.length === 0) return [];
  const users = await prisma.users.findMany({
    where: { username: { in: following.map((f) => f.followingUsername) } },
    select: { id: true },
  });
  return users.map((u) => u.id);
}

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

/** Ids of everyone who shares at least one group with the viewer. */
export async function getGroupmateIds(viewerId: number): Promise<Set<number>> {
  const rows = await prisma.groupMembership.findMany({
    where: { groups: { members: { some: { user: viewerId } } }, user: { not: viewerId } },
    select: { user: true },
  });
  return new Set(rows.map((r) => r.user));
}

/** Everyone whose going dates the viewer may see (not including the viewer). */
export async function getGoingVisibleIds(viewerId: number): Promise<Set<number>> {
  const [mutual, groupmates] = await Promise.all([
    getMutualFollowIds(viewerId),
    getGroupmateIds(viewerId),
  ]);
  return new Set([...mutual, ...groupmates]);
}

/** People the viewer follows whose going dates they may see; feeds the home page. */
export async function getFollowedGoingVisibleIds(viewerId: number): Promise<number[]> {
  const [followed, visible] = await Promise.all([
    getFollowedIds(viewerId),
    getGoingVisibleIds(viewerId),
  ]);
  return followed.filter((id) => visible.has(id));
}

/** Whether `viewerId` may see `ownerId`'s upcoming "going" dates. */
export async function canSeeGoingDates(viewerId: number | null, ownerId: number) {
  if (viewerId == null) return false;
  if (viewerId === ownerId) return true;
  return (await getGoingVisibleIds(viewerId)).has(ownerId);
}
