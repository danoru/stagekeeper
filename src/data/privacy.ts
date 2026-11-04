import prisma from "./db";

// Profiles and past viewings are public. Future "going" dates say where someone will be on a
// given night, so only the person, their mutual follows (each follows the other) and people
// who share a group with them see them.

export interface FollowedUser {
  id: number;
  username: string;
  image: string | null;
}

/** Who the viewer follows, and which of those follow back. */
async function getFollowGraph(viewerId: number) {
  const me = await prisma.users.findUnique({
    where: { id: viewerId },
    select: {
      username: true,
      following: { select: { followingUsername: true } },
    },
  });
  if (!me || me.following.length === 0)
    return { followed: [] as FollowedUser[], mutual: new Set<number>() };

  const followed = await prisma.users.findMany({
    where: { username: { in: me.following.map((f) => f.followingUsername) } },
    select: {
      id: true,
      username: true,
      image: true,
      following: {
        where: { followingUsername: { equals: me.username, mode: "insensitive" } },
        select: { user: true },
      },
    },
  });
  return {
    followed: followed.map(
      (u): FollowedUser => ({ id: u.id, username: u.username, image: u.image })
    ),
    mutual: new Set(followed.filter((u) => u.following.length > 0).map((u) => u.id)),
  };
}

/** Ids of everyone who shares at least one group with the viewer. */
async function getGroupmateIds(viewerId: number): Promise<Set<number>> {
  const rows = await prisma.groupMembership.findMany({
    where: { groups: { members: { some: { user: viewerId } } }, user: { not: viewerId } },
    select: { user: true },
  });
  return new Set(rows.map((r) => r.user));
}

/** Everyone whose going dates the viewer may see (not including the viewer). */
export async function getGoingVisibleIds(viewerId: number): Promise<Set<number>> {
  const [{ mutual }, groupmates] = await Promise.all([
    getFollowGraph(viewerId),
    getGroupmateIds(viewerId),
  ]);
  return new Set([...mutual, ...groupmates]);
}

/** People the viewer follows whose going dates they may see; feeds the home page. */
export async function getFollowedGoingVisibleIds(viewerId: number): Promise<number[]> {
  const [{ followed, mutual }, groupmates] = await Promise.all([
    getFollowGraph(viewerId),
    getGroupmateIds(viewerId),
  ]);
  return followed.map((u) => u.id).filter((id) => mutual.has(id) || groupmates.has(id));
}

/** The viewer's follows, plus those whose going dates they may see, for the show page panel. */
export async function getFollowedWithGoingAccess(viewerId: number) {
  const [{ followed, mutual }, groupmates] = await Promise.all([
    getFollowGraph(viewerId),
    getGroupmateIds(viewerId),
  ]);
  return { followed, goingVisible: new Set([...mutual, ...groupmates]) };
}

/** Whether `viewerId` may see `ownerId`'s upcoming "going" dates. */
export async function canSeeGoingDates(viewerId: number | null, ownerId: number) {
  if (viewerId == null) return false;
  if (viewerId === ownerId) return true;
  return (await getGoingVisibleIds(viewerId)).has(ownerId);
}
