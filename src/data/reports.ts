import type { ReportTarget } from "@prisma/client";

import { showPath, theatrePath } from "../utils/slug";

import prisma from "./db";

const MAX_DETAILS = 500;

interface ResolvedTarget {
  label: string;
  href: string;
}

/** Looks the target up rather than trusting what the page sent. */
async function resolveTarget(type: ReportTarget, id: number): Promise<ResolvedTarget | null> {
  switch (type) {
    case "MUSICAL": {
      const row = await prisma.musicals.findUnique({ where: { id }, select: { title: true } });
      return row && { label: row.title, href: showPath("musicals", row.title) };
    }
    case "PLAY": {
      const row = await prisma.plays.findUnique({ where: { id }, select: { title: true } });
      return row && { label: row.title, href: showPath("plays", row.title) };
    }
    case "THEATRE": {
      const row = await prisma.theatres.findUnique({ where: { id }, select: { name: true } });
      return row && { label: row.name, href: theatrePath(row.name) };
    }
    case "PERSON": {
      const row = await prisma.people.findUnique({
        where: { id },
        select: { name: true, slug: true },
      });
      return row && { label: row.name, href: `/people/${row.slug}` };
    }
    case "USER": {
      const row = await prisma.users.findUnique({ where: { id }, select: { username: true } });
      return row && { label: row.username, href: `/users/${row.username}` };
    }
    case "THEATRE_NOTE": {
      const row = await prisma.theatreNotes.findUnique({
        where: { id },
        select: { text: true, theatres: { select: { name: true } } },
      });
      return (
        row && {
          label: `Tip at ${row.theatres.name}: ${row.text.slice(0, 60)}`,
          href: theatrePath(row.theatres.name),
        }
      );
    }
    default:
      return null;
  }
}

export async function fileReport(args: {
  reporter: number;
  targetType: ReportTarget;
  targetId: number;
  reason: string;
  details: unknown;
}) {
  const target = await resolveTarget(args.targetType, args.targetId);
  if (!target) return false;
  const details =
    typeof args.details === "string" ? args.details.trim().slice(0, MAX_DETAILS) || null : null;
  await prisma.reports.create({
    data: {
      reporter: args.reporter,
      targetType: args.targetType,
      targetId: args.targetId,
      label: target.label,
      reason: args.reason,
      details,
    },
  });
  return true;
}

export async function getOpenReports() {
  const rows = await prisma.reports.findMany({
    where: { resolvedAt: null },
    select: {
      id: true,
      createdAt: true,
      targetType: true,
      targetId: true,
      label: true,
      reason: true,
      details: true,
      users: { select: { username: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  return Promise.all(
    rows.map(async (r) => ({
      ...r,
      // Null once the target has been removed or merged away.
      href: (await resolveTarget(r.targetType, r.targetId))?.href ?? null,
    }))
  );
}

export type OpenReport = Awaited<ReturnType<typeof getOpenReports>>[number];
