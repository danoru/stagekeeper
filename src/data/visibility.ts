import type { Prisma } from "@prisma/client";

import prisma from "./db";

// Shows and theatres members add stay PENDING until an admin approves them. Until then only
// admins, whoever added them and anyone who logged them can see them; to everyone else they
// don't exist, including on the profiles and feeds of the people who logged them.

const approvedShow = [
  { OR: [{ musical: null }, { musicals: { is: { status: "APPROVED" as const } } }] },
  { OR: [{ play: null }, { plays: { is: { status: "APPROVED" as const } } }] },
];

/** Logs the viewer may see: their own, plus anyone's on approved shows and theatres. */
export function visibleAttendance(viewerId: number | null): Prisma.attendanceWhereInput {
  const approved: Prisma.attendanceWhereInput = {
    AND: [
      ...approvedShow,
      { OR: [{ theatre: null }, { theatres: { is: { status: "APPROVED" } } }] },
    ],
  };
  return viewerId == null ? approved : { OR: [{ user: viewerId }, approved] };
}

/** Same rule for watchlist rows. */
export function visibleWatchlist(viewerId: number | null): Prisma.watchlistWhereInput {
  const approved: Prisma.watchlistWhereInput = { AND: approvedShow };
  return viewerId == null ? approved : { OR: [{ user: viewerId }, approved] };
}

/** Same rule for likes. */
export function visibleLikes(viewerId: number | null): Prisma.likedShowsWhereInput {
  const approved: Prisma.likedShowsWhereInput = { AND: approvedShow };
  return viewerId == null ? approved : { OR: [{ user: viewerId }, approved] };
}

export interface Viewer {
  id: number | null;
  isAdmin: boolean;
}

/** Filter for catalog rows (shows or theatres) the viewer may find. */
export function visibleCatalog(viewer: Viewer) {
  if (viewer.isAdmin) return {};
  if (viewer.id == null) return { status: "APPROVED" as const };
  return {
    OR: [
      { status: "APPROVED" as const },
      { createdBy: viewer.id },
      { attendance: { some: { user: viewer.id } } },
    ],
  };
}

type CatalogRef = { musical: number } | { play: number } | { theatre: number };

/** Whether the viewer may open a pending show or theatre's page. */
export async function canViewPending(
  ref: CatalogRef,
  createdBy: number | null,
  viewer: Viewer
): Promise<boolean> {
  if (viewer.isAdmin) return true;
  if (viewer.id == null) return false;
  if (createdBy === viewer.id) return true;
  const visit = await prisma.attendance.findFirst({
    where: { user: viewer.id, ...ref },
    select: { id: true },
  });
  return visit != null;
}
