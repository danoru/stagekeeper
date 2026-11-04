import prisma from "./db";
import { deleteGroupWith } from "./groups";

// Self-serve data export and account deletion.

/** Everything tied to the account, minus secrets, as plain JSON for download. */
export async function exportAccountData(userId: number) {
  const user = await prisma.users.findUnique({
    where: { id: userId },
    select: {
      username: true,
      email: true,
      emailVerifiedAt: true,
      firstName: true,
      lastName: true,
      location: true,
      website: true,
      bio: true,
      image: true,
      createdAt: true,
    },
  });
  if (!user) return null;

  const showSelect = { select: { title: true } };
  const [visits, likes, watchlist, following, followers, groups, suggestedCredits] =
    await Promise.all([
      prisma.attendance.findMany({
        where: { user: userId },
        select: {
          seenDate: true,
          going: true,
          rating: true,
          comment: true,
          createdAt: true,
          musicals: showSelect,
          plays: showSelect,
          theatres: { select: { name: true } },
          performances: {
            select: {
              startTime: true,
              musicals: showSelect,
              plays: showSelect,
              theatres: { select: { name: true } },
            },
          },
        },
        orderBy: { createdAt: "asc" },
      }),
      prisma.likedShows.findMany({
        where: { user: userId },
        select: { createdAt: true, musicals: showSelect, plays: showSelect },
      }),
      prisma.watchlist.findMany({
        where: { user: userId },
        select: { createdAt: true, musicals: showSelect, plays: showSelect },
      }),
      prisma.following.findMany({
        where: { user: userId },
        select: { followingUsername: true },
      }),
      prisma.following.findMany({
        where: { followingUsername: { equals: user.username, mode: "insensitive" } },
        select: { users: { select: { username: true } } },
      }),
      prisma.groupMembership.findMany({
        where: { user: userId },
        select: { role: true, joinedAt: true, groups: { select: { name: true } } },
      }),
      prisma.credits.findMany({
        where: { suggestedBy: userId },
        select: {
          createdAt: true,
          status: true,
          category: true,
          role: true,
          character: true,
          people: { select: { name: true } },
        },
      }),
    ]);

  return {
    exportedAt: new Date(),
    profile: user,
    visits,
    likes,
    watchlist,
    following: following.map((f) => f.followingUsername),
    followers: followers.map((f) => f.users.username),
    groups,
    suggestedCredits,
  };
}

/**
 * Removes the account and everything personal to it. Things other people depend on outlive it:
 * groups keep going under another owner, plans stay with the group, and shows, theatres and
 * credits the person added stay in the catalog without their name attached.
 */
export async function deleteAccount(userId: number) {
  const user = await prisma.users.findUnique({
    where: { id: userId },
    select: { username: true },
  });
  if (!user) return;

  await prisma.$transaction(
    async (tx) => {
      const memberships = await tx.groupMembership.findMany({
        where: { user: userId },
        select: { group: true, role: true },
      });

      for (const { group, role } of memberships) {
        const others = await tx.groupMembership.findMany({
          where: { group, user: { not: userId } },
          select: { user: true, role: true },
          orderBy: { joinedAt: "asc" },
        });
        if (others.length === 0) {
          await deleteGroupWith(tx, group);
          continue;
        }
        // A group never loses its last owner; the longest-standing member takes over.
        let heir = others.find((m) => m.role === "OWNER")?.user;
        if (!heir) {
          heir = others[0].user;
          if (role === "OWNER") {
            await tx.groupMembership.update({
              where: { group_user: { group, user: heir } },
              data: { role: "OWNER" },
            });
          }
        }
        // Plans and proposed dates require an author, and the rest of the group still uses them.
        await tx.groupPlan.updateMany({
          where: { group, createdBy: userId },
          data: { createdBy: heir },
        });
        await tx.groupPlanDate.updateMany({
          where: { proposedBy: userId, plans: { group } },
          data: { proposedBy: heir },
        });
      }

      // Anything left is on a plan in a group they've since left.
      const leftoverPlans = await tx.groupPlan.findMany({
        where: { OR: [{ createdBy: userId }, { dates: { some: { proposedBy: userId } } }] },
        select: {
          id: true,
          createdBy: true,
          groups: {
            select: {
              members: { where: { user: { not: userId } }, select: { user: true }, take: 1 },
            },
          },
        },
      });
      for (const plan of leftoverPlans) {
        const heir = plan.createdBy !== userId ? plan.createdBy : plan.groups.members[0]?.user;
        if (heir == null) continue;
        await tx.groupPlan.updateMany({
          where: { id: plan.id, createdBy: userId },
          data: { createdBy: heir },
        });
        await tx.groupPlanDate.updateMany({
          where: { plan: plan.id, proposedBy: userId },
          data: { proposedBy: heir },
        });
      }

      await tx.groupPlanAvailability.deleteMany({ where: { user: userId } });
      await tx.groupMembership.deleteMany({ where: { user: userId } });
      await tx.attendance.deleteMany({ where: { user: userId } });
      await tx.likedShows.deleteMany({ where: { user: userId } });
      await tx.watchlist.deleteMany({ where: { user: userId } });
      await tx.following.deleteMany({ where: { user: userId } });
      await tx.following.deleteMany({
        where: { followingUsername: { equals: user.username, mode: "insensitive" } },
      });
      await tx.musicals.updateMany({ where: { createdBy: userId }, data: { createdBy: null } });
      await tx.plays.updateMany({ where: { createdBy: userId }, data: { createdBy: null } });
      await tx.theatres.updateMany({ where: { createdBy: userId }, data: { createdBy: null } });

      // People, credits, reports and invites let go of the account through their foreign keys.
      await tx.users.delete({ where: { id: userId } });
    },
    { timeout: 20_000 }
  );
}
