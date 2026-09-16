import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";

import { createUserShow } from "../../../../src/data/catalog";
import prisma from "../../../../src/data/db";
import { authOptions } from "../../auth/[...nextauth]";

async function requireAdmin(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session || session.user.badge !== "ADMIN") {
    res.status(403).json({ error: "Forbidden." });
    return null;
  }
  return session;
}

const candidateInclude = {
  musicals: { select: { id: true, title: true } },
  plays: { select: { id: true, title: true } },
} as const;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const admin = await requireAdmin(req, res);
  if (!admin) return;

  // GET ?theatreId= — open candidates plus the theatre's seasons; no theatreId
  // returns the overview (theatres with last run + open count).
  if (req.method === "GET") {
    const theatreId = Number(req.query.theatreId);
    if (!Number.isInteger(theatreId)) {
      const theatres = await prisma.theatres.findMany({
        select: {
          id: true,
          name: true,
          link: true,
          seasonUrl: true,
          importRuns: { orderBy: { createdAt: "desc" }, take: 1 },
          seasons: {
            orderBy: { endDate: "desc" },
            take: 1,
            select: {
              id: true,
              name: true,
              startDate: true,
              endDate: true,
              _count: { select: { programming: true } },
            },
          },
          _count: {
            select: { importCandidates: { where: { state: { in: ["NEW", "DUPLICATE"] } } } },
          },
        },
        orderBy: { name: "asc" },
      });
      return res.status(200).json({
        theatres: theatres.map((t) => ({
          id: t.id,
          name: t.name,
          link: t.link,
          seasonUrl: t.seasonUrl,
          lastRun: t.importRuns[0] ?? null,
          latestSeason: t.seasons[0]
            ? {
                id: t.seasons[0].id,
                name: t.seasons[0].name,
                startDate: t.seasons[0].startDate,
                endDate: t.seasons[0].endDate,
                showCount: t.seasons[0]._count.programming,
              }
            : null,
          openCount: t._count.importCandidates,
        })),
      });
    }
    const [candidates, seasons] = await Promise.all([
      prisma.importCandidates.findMany({
        where: { theatre: theatreId, state: { in: ["NEW", "DUPLICATE"] } },
        include: candidateInclude,
        orderBy: [{ startDate: "asc" }, { id: "asc" }],
      }),
      prisma.seasons.findMany({
        where: { theatre: theatreId },
        select: { id: true, name: true, startDate: true, endDate: true },
        orderBy: { startDate: "desc" },
      }),
    ]);
    return res.status(200).json({ candidates, seasons });
  }

  // PATCH { id, action: "skip" } | { id, action: "approve", ... }
  if (req.method === "PATCH") {
    const { id, action } = req.body ?? {};
    const candidate = await prisma.importCandidates.findUnique({ where: { id: Number(id) } });
    if (!candidate) return res.status(404).json({ error: "Candidate not found." });

    if (action === "skip") {
      const updated = await prisma.importCandidates.update({
        where: { id: candidate.id },
        data: { state: "SKIPPED" },
      });
      return res.status(200).json(updated);
    }

    if (action !== "approve") return res.status(400).json({ error: "Unknown action." });

    const { type, musicalId, playId, newShow, seasonId, newSeason, startDate, endDate } = req.body;
    if (type !== "MUSICAL" && type !== "PLAY")
      return res.status(400).json({ error: "Type must be MUSICAL or PLAY." });
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;
    if (!start || !end || Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()))
      return res.status(400).json({ error: "Start and end dates are required." });
    if (end < start) return res.status(400).json({ error: "End date is before start date." });

    try {
      // Resolve the show first (outside the transaction: createUserShow has its own dedupe).
      let showId: number | null =
        type === "MUSICAL" ? Number(musicalId) || null : Number(playId) || null;
      if (!showId) {
        const title = typeof newShow?.title === "string" ? newShow.title.trim() : "";
        if (title.length < 2)
          return res.status(400).json({ error: "Pick a show or give a title." });
        const created = await createUserShow({
          type,
          title,
          premiereYear: newShow?.premiereYear ? Number(newShow.premiereYear) : null,
          createdBy: Number(admin.user.id),
        });
        showId = created.show.id;
      }

      const result = await prisma.$transaction(async (tx) => {
        let season = Number(seasonId) || null;
        if (!season) {
          if (!newSeason?.name || !newSeason?.startDate || !newSeason?.endDate)
            throw new Error("Pick a season or provide a new one.");
          const s = await tx.seasons.create({
            data: {
              theatre: candidate.theatre,
              name: String(newSeason.name).trim(),
              startDate: new Date(newSeason.startDate),
              endDate: new Date(newSeason.endDate),
            },
          });
          season = s.id;
        } else {
          // Keep the season's range covering everything scheduled in it.
          const s = await tx.seasons.findUnique({ where: { id: season } });
          if (!s || s.theatre !== candidate.theatre) throw new Error("Season not found.");
          await tx.seasons.update({
            where: { id: season },
            data: {
              startDate: start < s.startDate ? start : s.startDate,
              endDate: end > s.endDate ? end : s.endDate,
            },
          });
        }
        const programming = await tx.programming.create({
          data: {
            type,
            musical: type === "MUSICAL" ? showId : null,
            play: type === "PLAY" ? showId : null,
            season,
            startDate: start,
            endDate: end,
            dayTimes: {},
          },
        });
        const updated = await tx.importCandidates.update({
          where: { id: candidate.id },
          data: {
            state: "APPROVED",
            matchType: type,
            matchMusical: type === "MUSICAL" ? showId : null,
            matchPlay: type === "PLAY" ? showId : null,
            existingProgramming: programming.id,
          },
          include: candidateInclude,
        });
        return { candidate: updated, programming, seasonId: season };
      });
      return res.status(200).json(result);
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to approve candidate.";
      return res.status(400).json({ error: message });
    }
  }

  res.setHeader("Allow", ["GET", "PATCH"]);
  return res.status(405).json({ error: `Method ${req.method} not allowed.` });
}
