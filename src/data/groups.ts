import { Availability, GroupRole, PlanStatus } from "@prisma/client";

import prisma from "./db";

export async function getUserGroups(userId: number) {
  const memberships = await prisma.groupMembership.findMany({
    where: { user: userId },
    include: {
      groups: {
        include: { _count: { select: { members: true } } },
      },
    },
    orderBy: { groups: { name: "asc" } },
  });
  return memberships;
}

export async function getGroupById(groupId: number) {
  return prisma.groups.findUnique({
    where: { id: groupId },
    include: {
      members: {
        include: { users: true },
        orderBy: [{ role: "asc" }, { joinedAt: "asc" }],
      },
    },
  });
}

export async function getGroupMembership(groupId: number, userId: number) {
  return prisma.groupMembership.findUnique({
    where: { group_user: { group: groupId, user: userId } },
  });
}

export async function isGroupMember(groupId: number, userId: number) {
  const membership = await getGroupMembership(groupId, userId);
  return membership !== null;
}

export async function isGroupOwner(groupId: number, userId: number) {
  const membership = await getGroupMembership(groupId, userId);
  return membership?.role === GroupRole.OWNER;
}

export async function getGroupUpcomingAttendance(groupId: number, take = 20) {
  const memberIds = await prisma.groupMembership.findMany({
    where: { group: groupId },
    select: { user: true },
  });
  const ids = memberIds.map((m) => m.user);
  if (ids.length === 0) return [];

  return prisma.attendance.findMany({
    where: {
      user: { in: ids },
      performances: { startTime: { gte: new Date() } },
    },
    include: {
      performances: { include: { musicals: true, plays: true, theatres: true } },
      users: true,
    },
    orderBy: { performances: { startTime: "asc" } },
    take,
  });
}

export async function getGroupWatchlistOverlap(groupId: number) {
  const memberIds = await prisma.groupMembership.findMany({
    where: { group: groupId },
    select: { user: true },
  });
  const ids = memberIds.map((m) => m.user);
  if (ids.length === 0) return [];

  const rows = await prisma.watchlist.findMany({
    where: { user: { in: ids } },
    include: {
      musicals: true,
      plays: true,
      users: { select: { id: true, username: true, image: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  type Bucket = {
    type: "MUSICAL" | "PLAY";
    showId: number;
    title: string;
    playbill: string;
    members: { id: number; username: string; image: string | null }[];
  };
  const buckets = new Map<string, Bucket>();
  for (const row of rows) {
    const showId = row.type === "MUSICAL" ? row.musical : row.play;
    const show = row.type === "MUSICAL" ? row.musicals : row.plays;
    if (!showId || !show) continue;
    const key = `${row.type}-${showId}`;
    let bucket = buckets.get(key);
    if (!bucket) {
      bucket = {
        type: row.type,
        showId,
        title: show.title,
        playbill: show.playbill,
        members: [],
      };
      buckets.set(key, bucket);
    }
    bucket.members.push(row.users);
  }

  return Array.from(buckets.values())
    .filter((b) => b.members.length >= 2)
    .sort((a, b) => b.members.length - a.members.length || a.title.localeCompare(b.title));
}

export async function getGroupWatchlistProgramming(groupId: number) {
  const memberIds = await prisma.groupMembership.findMany({
    where: { group: groupId },
    select: { user: true },
  });
  const ids = memberIds.map((m) => m.user);
  if (ids.length === 0) return [];

  const watchlistRows = await prisma.watchlist.findMany({
    where: { user: { in: ids } },
    include: { users: { select: { id: true, username: true, image: true } } },
  });
  if (watchlistRows.length === 0) return [];

  type Member = { id: number; username: string; image: string | null };
  const showToMembers = new Map<string, Member[]>();
  for (const row of watchlistRows) {
    const showId = row.type === "MUSICAL" ? row.musical : row.play;
    if (!showId) continue;
    const key = `${row.type}-${showId}`;
    let arr = showToMembers.get(key);
    if (!arr) {
      arr = [];
      showToMembers.set(key, arr);
    }
    if (!arr.some((u) => u.id === row.users.id)) {
      arr.push(row.users);
    }
  }

  const musicalIds: number[] = [];
  const playIds: number[] = [];
  for (const key of showToMembers.keys()) {
    const [type, idStr] = key.split("-");
    const id = Number(idStr);
    if (type === "MUSICAL") musicalIds.push(id);
    else playIds.push(id);
  }

  const now = new Date();
  const upcomingLimit = new Date();
  upcomingLimit.setMonth(upcomingLimit.getMonth() + 6);

  const dateWindow = {
    OR: [
      { AND: [{ startDate: { lte: now } }, { endDate: { gte: now } }] },
      { startDate: { lte: upcomingLimit, gte: now } },
    ],
  };

  const [musicalProgramming, playProgramming] = await Promise.all([
    musicalIds.length === 0
      ? Promise.resolve([])
      : prisma.programming.findMany({
          where: { type: "MUSICAL", musical: { in: musicalIds }, ...dateWindow },
          include: {
            musicals: true,
            plays: true,
            seasons: { include: { theatres: true } },
          },
          orderBy: { startDate: "asc" },
        }),
    playIds.length === 0
      ? Promise.resolve([])
      : prisma.programming.findMany({
          where: { type: "PLAY", play: { in: playIds }, ...dateWindow },
          include: {
            musicals: true,
            plays: true,
            seasons: { include: { theatres: true } },
          },
          orderBy: { startDate: "asc" },
        }),
  ]);

  return [...musicalProgramming, ...playProgramming]
    .map((p) => {
      const showId = p.type === "MUSICAL" ? p.musical : p.play;
      const key = `${p.type}-${showId}`;
      return { ...p, interestedMembers: showToMembers.get(key) ?? [] };
    })
    .sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
}

const PLAN_INCLUDE = {
  programmings: {
    include: {
      musicals: true,
      plays: true,
      seasons: { include: { theatres: true } },
    },
  },
  users: { select: { id: true, username: true, image: true } },
  selected: true,
  dates: {
    include: {
      users: { select: { id: true, username: true, image: true } },
      availability: {
        include: { users: { select: { id: true, username: true, image: true } } },
      },
    },
    orderBy: { startTime: "asc" as const },
  },
};

export async function getGroupPlans(groupId: number) {
  return prisma.groupPlan.findMany({
    where: { group: groupId },
    include: PLAN_INCLUDE,
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
  });
}

export async function getPlanWithGroup(planId: number) {
  return prisma.groupPlan.findUnique({
    where: { id: planId },
    select: { id: true, group: true, createdBy: true, status: true },
  });
}

export async function createPlanWithDates(args: {
  groupId: number;
  programmingId: number;
  createdBy: number;
  note?: string | null;
  startTimes: Date[];
}) {
  if (args.startTimes.length === 0) {
    throw new Error("At least one candidate date is required.");
  }
  return prisma.$transaction(async (tx) => {
    const plan = await tx.groupPlan.create({
      data: {
        group: args.groupId,
        programming: args.programmingId,
        createdBy: args.createdBy,
        note: args.note ?? null,
      },
    });
    await tx.groupPlanDate.createMany({
      data: args.startTimes.map((startTime) => ({
        plan: plan.id,
        startTime,
        proposedBy: args.createdBy,
      })),
    });
    return plan;
  });
}

export async function updatePlanNote(planId: number, note: string | null) {
  return prisma.groupPlan.update({
    where: { id: planId },
    data: { note },
  });
}

export async function addCandidateDate(args: {
  planId: number;
  startTime: Date;
  proposedBy: number;
}) {
  return prisma.groupPlanDate.create({
    data: {
      plan: args.planId,
      startTime: args.startTime,
      proposedBy: args.proposedBy,
    },
  });
}

export async function removeCandidateDate(planDateId: number) {
  return prisma.$transaction([
    prisma.groupPlanAvailability.deleteMany({ where: { planDate: planDateId } }),
    prisma.groupPlanDate.delete({ where: { id: planDateId } }),
  ]);
}

export async function setAvailability(args: {
  planDateId: number;
  userId: number;
  status: Availability;
}) {
  return prisma.groupPlanAvailability.upsert({
    where: { planDate_user: { planDate: args.planDateId, user: args.userId } },
    update: { status: args.status, updatedAt: new Date() },
    create: { planDate: args.planDateId, user: args.userId, status: args.status },
  });
}

export async function clearAvailability(planDateId: number, userId: number) {
  return prisma.groupPlanAvailability.deleteMany({
    where: { planDate: planDateId, user: userId },
  });
}

export async function confirmPlan(planId: number, planDateId: number) {
  const date = await prisma.groupPlanDate.findUnique({
    where: { id: planDateId },
    select: { plan: true },
  });
  if (!date || date.plan !== planId) {
    throw new Error("Selected date does not belong to this plan.");
  }
  return prisma.groupPlan.update({
    where: { id: planId },
    data: { status: PlanStatus.CONFIRMED, selectedDate: planDateId },
  });
}

export async function reopenPlan(planId: number) {
  return prisma.groupPlan.update({
    where: { id: planId },
    data: { status: PlanStatus.POLLING, selectedDate: null },
  });
}

export async function cancelPlan(planId: number) {
  return prisma.groupPlan.update({
    where: { id: planId },
    data: { status: PlanStatus.CANCELED, selectedDate: null },
  });
}

export async function deletePlan(planId: number) {
  return prisma.$transaction(async (tx) => {
    const dates = await tx.groupPlanDate.findMany({
      where: { plan: planId },
      select: { id: true },
    });
    const dateIds = dates.map((d) => d.id);
    if (dateIds.length > 0) {
      await tx.groupPlanAvailability.deleteMany({ where: { planDate: { in: dateIds } } });
    }
    await tx.groupPlan.update({
      where: { id: planId },
      data: { selectedDate: null },
    });
    await tx.groupPlanDate.deleteMany({ where: { plan: planId } });
    await tx.groupPlan.delete({ where: { id: planId } });
  });
}

export type GroupActivityEvent =
  | {
      kind: "attendance";
      timestamp: Date;
      user: { id: number; username: string };
      show: { title: string; type: "MUSICAL" | "PLAY"; playbill: string };
      theatre: string | null;
      seenDate: Date | null;
      rating: number | null;
      comment: string | null;
    }
  | {
      kind: "plan_created";
      timestamp: Date;
      user: { id: number; username: string };
      group: { id: number; name: string };
      show: { title: string; type: "MUSICAL" | "PLAY"; playbill: string };
      theatre: string | null;
      planId: number;
    }
  | {
      kind: "plan_confirmed";
      timestamp: Date;
      user: { id: number; username: string }; // creator (not necessarily the confirmer)
      group: { id: number; name: string };
      show: { title: string; type: "MUSICAL" | "PLAY"; playbill: string };
      theatre: string | null;
      startTime: Date;
      planId: number;
    };

export async function getGroupActivityFeed(
  viewerId: number,
  take = 50
): Promise<GroupActivityEvent[]> {
  const myMemberships = await prisma.groupMembership.findMany({
    where: { user: viewerId },
    select: { group: true },
  });
  const myGroupIds = myMemberships.map((m) => m.group);
  if (myGroupIds.length === 0) return [];

  const memberRows = await prisma.groupMembership.findMany({
    where: { group: { in: myGroupIds } },
    select: { user: true },
  });
  const memberIds = Array.from(new Set(memberRows.map((m) => m.user)));

  const [attendance, plans] = await Promise.all([
    prisma.attendance.findMany({
      where: { user: { in: memberIds } },
      include: {
        performances: { include: { musicals: true, plays: true, theatres: true } },
        musicals: true,
        plays: true,
        theatres: true,
        users: { select: { id: true, username: true } },
      },
      orderBy: { createdAt: "desc" },
      take,
    }),
    prisma.groupPlan.findMany({
      where: { group: { in: myGroupIds } },
      include: {
        groups: true,
        programmings: {
          include: {
            musicals: true,
            plays: true,
            seasons: { include: { theatres: true } },
          },
        },
        selected: true,
        users: { select: { id: true, username: true } },
      },
      orderBy: { createdAt: "desc" },
      take,
    }),
  ]);

  const events: GroupActivityEvent[] = [];

  for (const a of attendance) {
    let title: string | undefined;
    let type: "MUSICAL" | "PLAY" | undefined;
    let playbill: string | undefined;
    let theatreName: string | null = null;

    if (a.performances) {
      type = a.performances.type;
      const show = type === "MUSICAL" ? a.performances.musicals : a.performances.plays;
      title = show?.title;
      playbill = show?.playbill;
      theatreName = a.performances.theatres?.name ?? null;
    } else if (a.musicals) {
      type = "MUSICAL";
      title = a.musicals.title;
      playbill = a.musicals.playbill;
      theatreName = a.theatres?.name ?? null;
    } else if (a.plays) {
      type = "PLAY";
      title = a.plays.title;
      playbill = a.plays.playbill;
      theatreName = a.theatres?.name ?? null;
    }
    if (!title || !type || !playbill || !a.users) continue;

    events.push({
      kind: "attendance",
      timestamp: a.createdAt,
      user: a.users,
      show: { title, type, playbill },
      theatre: theatreName,
      seenDate: a.seenDate ?? a.performances?.startTime ?? null,
      rating: a.rating != null ? Number(a.rating) : null,
      comment: a.comment ?? null,
    });
  }

  for (const p of plans) {
    const prog = p.programmings;
    const show = prog.type === "MUSICAL" ? prog.musicals : prog.plays;
    if (!show) continue;
    const theatreName = prog.seasons?.theatres.name ?? null;

    events.push({
      kind: "plan_created",
      timestamp: p.createdAt,
      user: p.users,
      group: { id: p.groups.id, name: p.groups.name },
      show: { title: show.title, type: prog.type, playbill: show.playbill },
      theatre: theatreName,
      planId: p.id,
    });

    if (p.status === "CONFIRMED" && p.selected) {
      events.push({
        kind: "plan_confirmed",
        timestamp: p.selected.createdAt,
        user: p.users,
        group: { id: p.groups.id, name: p.groups.name },
        show: { title: show.title, type: prog.type, playbill: show.playbill },
        theatre: theatreName,
        startTime: p.selected.startTime,
        planId: p.id,
      });
    }
  }

  return events
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(0, take);
}

export async function getUpcomingProgrammingForPicker(take = 100) {
  const now = new Date();
  const limit = new Date();
  limit.setMonth(limit.getMonth() + 6);
  return prisma.programming.findMany({
    where: {
      OR: [
        { AND: [{ startDate: { lte: now } }, { endDate: { gte: now } }] },
        { startDate: { lte: limit, gte: now } },
      ],
    },
    include: {
      musicals: true,
      plays: true,
      seasons: { include: { theatres: true } },
    },
    orderBy: { startDate: "asc" },
    take,
  });
}
