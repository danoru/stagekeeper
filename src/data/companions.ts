import { theatreToday } from "../utils/schedule";

import prisma from "./db";
import { getGoingVisibleIds } from "./privacy";

// "Went together": the owner of a past visit tags someone who came. Only people who can already
// see each other's going dates (mutual follows, groupmates) can be tagged, nothing shows until
// the tagged member accepts, and declining is silent.

export const MAX_COMPANIONS = 12;

export class CompanionError extends Error {}

/** People the viewer may tag: mutual follows and groupmates, by username. */
export async function getCompanionCandidates(userId: number) {
  const ids = await getGoingVisibleIds(userId);
  if (ids.size === 0) return [];
  return prisma.users.findMany({
    where: { id: { in: [...ids] } },
    select: { id: true, username: true, image: true },
    orderBy: { username: "asc" },
  });
}

async function ownPastVisit(userId: number, attendanceId: number) {
  const visit = await prisma.attendance.findFirst({
    where: { id: attendanceId, user: userId },
    select: {
      id: true,
      going: true,
      seenDate: true,
      performances: { select: { startTime: true } },
    },
  });
  if (!visit) throw new CompanionError("Visit not found.");
  const day =
    visit.seenDate ?? (visit.performances ? theatreToday(visit.performances.startTime) : null);
  if (!day) throw new CompanionError("Add the date to this visit before tagging who came.");
  if (visit.going && day >= theatreToday()) {
    throw new CompanionError("You can tag who came once the date has passed.");
  }
  return visit;
}

export async function tagCompanion(userId: number, attendanceId: number, username: string) {
  await ownPastVisit(userId, attendanceId);
  const target = await prisma.users.findFirst({
    where: { username: { equals: username, mode: "insensitive" } },
    select: { id: true },
  });
  if (!target || target.id === userId) throw new CompanionError("Pick someone from the list.");
  const allowed = await getGoingVisibleIds(userId);
  if (!allowed.has(target.id)) {
    throw new CompanionError("You can only tag mutual follows and groupmates.");
  }
  const count = await prisma.attendanceCompanion.count({ where: { attendance: attendanceId } });
  if (count >= MAX_COMPANIONS) throw new CompanionError("That's everyone this visit can hold.");
  await prisma.attendanceCompanion.upsert({
    where: { attendance_user: { attendance: attendanceId, user: target.id } },
    create: { attendance: attendanceId, user: target.id, taggedBy: userId },
    update: {},
  });
}

/** The tagger takes a tag back, or the tagged member removes themselves. */
export async function removeCompanion(userId: number, companionId: number) {
  const removed = await prisma.attendanceCompanion.deleteMany({
    where: { id: companionId, OR: [{ taggedBy: userId }, { user: userId }] },
  });
  if (removed.count === 0) throw new CompanionError("Tag not found.");
}

/** Invitations waiting for the viewer. */
export async function getCompanionInvites(userId: number) {
  const rows = await prisma.attendanceCompanion.findMany({
    where: { user: userId, status: "PENDING" },
    select: {
      id: true,
      tagger: { select: { username: true } },
      visit: {
        select: {
          seenDate: true,
          musicals: { select: { title: true, playbill: true } },
          plays: { select: { title: true, playbill: true } },
          theatres: { select: { name: true } },
          performances: {
            select: {
              startTime: true,
              musicals: { select: { title: true, playbill: true } },
              plays: { select: { title: true, playbill: true } },
              theatres: { select: { name: true } },
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 10,
  });
  return rows.map((r) => {
    const v = r.visit;
    const perf = v.performances;
    const show = v.musicals ?? v.plays ?? perf?.musicals ?? perf?.plays ?? null;
    return {
      id: r.id,
      from: r.tagger.username,
      title: show?.title ?? "a show",
      playbill: show?.playbill ?? "",
      theatre: (v.theatres ?? perf?.theatres)?.name ?? null,
      day: v.seenDate ?? (perf ? theatreToday(perf.startTime) : null),
    };
  });
}

export type CompanionInvite = Awaited<ReturnType<typeof getCompanionInvites>>[number];

/**
 * Accepting adds the visit to the viewer's log (same show, theatre, date and showtime) unless
 * they already logged that show that day, in which case the two visits are linked.
 */
export async function respondToCompanion(userId: number, companionId: number, accept: boolean) {
  return prisma.$transaction(async (tx) => {
    const tag = await tx.attendanceCompanion.findFirst({
      where: { id: companionId, user: userId, status: "PENDING" },
      select: {
        id: true,
        visit: {
          select: {
            musical: true,
            play: true,
            theatre: true,
            seenDate: true,
            performance: true,
            programming: true,
            performances: { select: { startTime: true, musical: true, play: true } },
          },
        },
      },
    });
    if (!tag) throw new CompanionError("Invitation not found.");
    if (!accept) {
      await tx.attendanceCompanion.update({ where: { id: tag.id }, data: { status: "DECLINED" } });
      return { linkedAttendance: null };
    }
    const v = tag.visit;
    const day = v.seenDate ?? (v.performances ? theatreToday(v.performances.startTime) : null);
    const musical = v.musical ?? v.performances?.musical ?? null;
    const play = v.play ?? v.performances?.play ?? null;
    const show = musical != null ? { musical } : { play };
    const existing = day
      ? await tx.attendance.findFirst({
          where: {
            user: userId,
            seenDate: day,
            OR: [show, { performances: show }],
          },
          select: { id: true },
        })
      : null;
    const linked =
      existing ??
      (await tx.attendance.create({
        data: {
          user: userId,
          musical: v.performance ? null : musical,
          play: v.performance ? null : play,
          performance: v.performance,
          theatre: v.performance ? null : v.theatre,
          seenDate: day,
          programming: v.programming,
          going: false,
        },
        select: { id: true },
      }));
    await tx.attendanceCompanion.update({
      where: { id: tag.id },
      data: { status: "ACCEPTED", linkedAttendance: linked.id },
    });
    return { linkedAttendance: linked.id };
  });
}
