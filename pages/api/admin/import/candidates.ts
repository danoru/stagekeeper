import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";

import { createUserShow } from "../../../../src/data/catalog";
import prisma from "../../../../src/data/db";
import { submitCredits } from "../../../../src/data/people";
import { addImportedShowtimes, ShowtimeError } from "../../../../src/data/showtimes";
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

/** Stored cast ([{ name, character }]) as pending cast credits on a run. */
async function addCandidateCast(raw: unknown, programmingId: number, userId: number) {
  const rows = (Array.isArray(raw) ? raw : []).flatMap((m) => {
    const member = m as { name?: unknown; character?: unknown };
    if (typeof member.name !== "string" || member.name.trim().length < 2) return [];
    return [
      {
        name: member.name.trim(),
        category: "CAST" as const,
        character: typeof member.character === "string" ? member.character : null,
        role: null,
      },
    ];
  });
  if (rows.length === 0) return { created: 0, linked: 0, newPeople: 0, skipped: 0 };
  // Pending, like a member's suggestion: an admin still reviews names in /admin/credits.
  return submitCredits({ programmingId, userId, approve: false, rows, ambiguous: "skip" });
}

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

    // Already-scheduled runs are how real showtimes reach existing programming.
    if (action === "apply-showtimes") {
      if (!candidate.existingProgramming) {
        return res.status(400).json({ error: "This candidate has no existing run." });
      }
      try {
        const added = await prisma.$transaction((tx) =>
          addImportedShowtimes(candidate.existingProgramming!, candidate.showtimes, tx)
        );
        return res.status(200).json({ added });
      } catch (e) {
        const message = e instanceof ShowtimeError ? e.message : "Failed to add showtimes.";
        return res.status(400).json({ error: message });
      }
    }

    // The page named the cast: offer it as pending credits on the run, for /admin/credits.
    if (action === "apply-cast") {
      if (!candidate.existingProgramming) {
        return res.status(400).json({ error: "This candidate has no run yet." });
      }
      const result = await addCandidateCast(
        candidate.cast,
        candidate.existingProgramming,
        Number(admin.user.id)
      );
      return res.status(200).json(result);
    }

    if (action !== "approve") return res.status(400).json({ error: "Unknown action." });
    if (candidate.state === "APPROVED")
      return res.status(409).json({ error: "This run was already approved." });

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
          approve: true,
        });
        showId = created.show.id;
      }

      const result = await prisma.$transaction(async (tx) => {
        // Claim the candidate first so a double-submitted approve can't create two runs.
        const claimed = await tx.importCandidates.updateMany({
          where: { id: candidate.id, state: { not: "APPROVED" } },
          data: { state: "APPROVED" },
        });
        if (claimed.count === 0) throw new Error("This run was already approved.");

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
        await addImportedShowtimes(programming.id, candidate.showtimes, tx);
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
      const cast =
        req.body?.importCast === false
          ? null
          : await addCandidateCast(candidate.cast, result.programming.id, Number(admin.user.id));
      return res.status(200).json({ ...result, cast });
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to approve candidate.";
      return res.status(400).json({ error: message });
    }
  }

  res.setHeader("Allow", ["GET", "PATCH"]);
  return res.status(405).json({ error: `Method ${req.method} not allowed.` });
}
