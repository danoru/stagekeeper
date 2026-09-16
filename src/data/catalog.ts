import type { PerformanceType } from "@prisma/client";

import prisma from "./db";

export const DEFAULT_PLAYBILL = "https://picsum.photos/649/1024";

export type ShowSearchResult = {
  id: number;
  type: PerformanceType;
  title: string;
  playbill: string;
  premiere: Date | null;
  status: "PENDING" | "APPROVED";
};

// Substring search across musicals and plays, exact-title matches first.
export async function searchShows(query: string, take = 10): Promise<ShowSearchResult[]> {
  const q = query.trim();
  if (!q) return [];
  const [musicals, plays] = await Promise.all([
    prisma.musicals.findMany({
      where: { title: { contains: q, mode: "insensitive" } },
      select: { id: true, title: true, playbill: true, premiere: true, status: true },
      orderBy: { title: "asc" },
      take,
    }),
    prisma.plays.findMany({
      where: { title: { contains: q, mode: "insensitive" } },
      select: { id: true, title: true, playbill: true, premiere: true, status: true },
      orderBy: { title: "asc" },
      take,
    }),
  ]);
  const lower = q.toLowerCase();
  const rank = (title: string) => {
    const t = title.toLowerCase();
    if (t === lower) return 0;
    if (t.startsWith(lower)) return 1;
    return 2;
  };
  return [
    ...musicals.map((m) => ({ ...m, type: "MUSICAL" as const })),
    ...plays.map((p) => ({ ...p, type: "PLAY" as const })),
  ]
    .sort((a, b) => rank(a.title) - rank(b.title) || a.title.localeCompare(b.title))
    .slice(0, take);
}

export async function searchTheatres(query: string, take = 10) {
  const q = query.trim();
  if (!q) return [];
  return prisma.theatres.findMany({
    where: {
      OR: [
        { name: { contains: q, mode: "insensitive" } },
        { location: { contains: q, mode: "insensitive" } },
      ],
    },
    select: { id: true, name: true, location: true, status: true },
    orderBy: { name: "asc" },
    take,
  });
}

// Any signed-in user can add a show; it lands as PENDING for an admin to tidy up.
// Titles are unique, so an existing match is returned rather than erroring.
export async function createUserShow(args: {
  type: PerformanceType;
  title: string;
  premiereYear?: number | null;
  createdBy: number;
}) {
  const title = args.title.trim();
  const premiere =
    args.premiereYear && Number.isFinite(args.premiereYear)
      ? new Date(Date.UTC(args.premiereYear, 0, 1))
      : null;

  if (args.type === "MUSICAL") {
    const existing = await prisma.musicals.findFirst({
      where: { title: { equals: title, mode: "insensitive" } },
    });
    if (existing) return { show: existing, type: "MUSICAL" as const, created: false };
    const show = await prisma.musicals.create({
      data: {
        title,
        premiere,
        musicBy: "",
        lyricsBy: "",
        bookBy: "",
        status: "PENDING",
        createdBy: args.createdBy,
      },
    });
    return { show, type: "MUSICAL" as const, created: true };
  }

  const existing = await prisma.plays.findFirst({
    where: { title: { equals: title, mode: "insensitive" } },
  });
  if (existing) return { show: existing, type: "PLAY" as const, created: false };
  const show = await prisma.plays.create({
    data: { title, premiere, writtenBy: "", status: "PENDING", createdBy: args.createdBy },
  });
  return { show, type: "PLAY" as const, created: true };
}

export async function createUserTheatre(args: {
  name: string;
  location: string;
  createdBy: number;
}) {
  const name = args.name.trim();
  const existing = await prisma.theatres.findFirst({
    where: { name: { equals: name, mode: "insensitive" } },
  });
  if (existing) return { theatre: existing, created: false };
  const theatre = await prisma.theatres.create({
    data: {
      name,
      location: args.location.trim(),
      status: "PENDING",
      createdBy: args.createdBy,
    },
  });
  return { theatre, created: true };
}

export async function getPendingContent() {
  const [musicals, plays, theatres] = await Promise.all([
    prisma.musicals.findMany({
      where: { status: "PENDING" },
      include: {
        creator: { select: { id: true, username: true } },
        _count: { select: { attendance: true, watchlist: true, likedShows: true } },
      },
      orderBy: { id: "desc" },
    }),
    prisma.plays.findMany({
      where: { status: "PENDING" },
      include: {
        creator: { select: { id: true, username: true } },
        _count: { select: { attendance: true, watchlist: true, likedShows: true } },
      },
      orderBy: { id: "desc" },
    }),
    prisma.theatres.findMany({
      where: { status: "PENDING" },
      include: {
        creator: { select: { id: true, username: true } },
        _count: { select: { attendance: true } },
      },
      orderBy: { id: "desc" },
    }),
  ]);
  return { musicals, plays, theatres };
}

// Re-point every reference from a duplicate show to the canonical one, then remove it.
export async function mergeShow(type: PerformanceType, fromId: number, intoId: number) {
  if (fromId === intoId) throw new Error("Cannot merge a show into itself.");
  const field = type === "MUSICAL" ? "musical" : "play";
  return prisma.$transaction(async (tx) => {
    await tx.attendance.updateMany({ where: { [field]: fromId }, data: { [field]: intoId } });
    await tx.performances.updateMany({ where: { [field]: fromId }, data: { [field]: intoId } });
    await tx.programming.updateMany({ where: { [field]: fromId }, data: { [field]: intoId } });

    // Unique per (user, show): drop the duplicate's row when the user already has the target.
    const watchRows = await tx.watchlist.findMany({ where: { [field]: fromId } });
    for (const row of watchRows) {
      const clash = await tx.watchlist.findFirst({ where: { user: row.user, [field]: intoId } });
      if (clash) await tx.watchlist.delete({ where: { id: row.id } });
      else await tx.watchlist.update({ where: { id: row.id }, data: { [field]: intoId } });
    }
    const likeRows = await tx.likedShows.findMany({ where: { [field]: fromId } });
    for (const row of likeRows) {
      const clash = await tx.likedShows.findFirst({ where: { user: row.user, [field]: intoId } });
      if (clash) await tx.likedShows.delete({ where: { id: row.id } });
      else await tx.likedShows.update({ where: { id: row.id }, data: { [field]: intoId } });
    }

    if (type === "MUSICAL") await tx.musicals.delete({ where: { id: fromId } });
    else await tx.plays.delete({ where: { id: fromId } });
  });
}

export async function mergeTheatre(fromId: number, intoId: number) {
  if (fromId === intoId) throw new Error("Cannot merge a theatre into itself.");
  return prisma.$transaction(async (tx) => {
    await tx.attendance.updateMany({ where: { theatre: fromId }, data: { theatre: intoId } });
    await tx.performances.updateMany({ where: { theatre: fromId }, data: { theatre: intoId } });
    await tx.seasons.updateMany({ where: { theatre: fromId }, data: { theatre: intoId } });
    await tx.theatres.delete({ where: { id: fromId } });
  });
}
