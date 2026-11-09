import { buildHomeTheatreCard, type HomeTheatreCard } from "../utils/homeTheatres";

import prisma from "./db";
import { attendanceInclude, normalizeAttendanceRows } from "./performances";
import { visibleCatalog, type Viewer } from "./visibility";

// A member's home theatres (`theatreFollows`). They're private: the list shapes that member's
// home page and appears in their data export, and nowhere else.

export const HOME_THEATRE_LIMIT = 12;

export async function getHomeTheatreIds(userId: number): Promise<number[]> {
  const rows = await prisma.theatreFollows.findMany({
    where: { user: userId },
    select: { theatre: true },
  });
  return rows.map((r) => r.theatre);
}

export type AddHomeTheatreResult = "added" | "already" | "limit" | "not-found";

export async function addHomeTheatre(
  userId: number,
  theatreId: number,
  viewer: Viewer
): Promise<AddHomeTheatreResult> {
  const theatre = await prisma.theatres.findFirst({
    where: { id: theatreId, ...visibleCatalog(viewer) },
    select: { id: true },
  });
  if (!theatre) return "not-found";

  const existing = await prisma.theatreFollows.findMany({
    where: { user: userId },
    select: { theatre: true },
  });
  if (existing.some((f) => f.theatre === theatreId)) return "already";
  if (existing.length >= HOME_THEATRE_LIMIT) return "limit";

  await prisma.theatreFollows.create({ data: { user: userId, theatre: theatreId } });
  return "added";
}

export async function removeHomeTheatre(userId: number, theatreId: number) {
  await prisma.theatreFollows.deleteMany({ where: { user: userId, theatre: theatreId } });
}

const showSelect = { title: true, playbill: true, status: true } as const;

/** Cards for the home page, in the order the theatres were added. Two queries. */
export async function getHomeTheatres(userId: number): Promise<HomeTheatreCard[]> {
  const follows = await prisma.theatreFollows.findMany({
    where: { user: userId },
    orderBy: { createdAt: "asc" },
    select: {
      theatres: {
        select: {
          id: true,
          name: true,
          location: true,
          image: true,
          seasons: {
            // Enough to find the season running now, the next one and the last one.
            orderBy: { startDate: "desc" },
            take: 4,
            select: {
              id: true,
              name: true,
              startDate: true,
              endDate: true,
              programming: {
                select: {
                  id: true,
                  type: true,
                  startDate: true,
                  endDate: true,
                  musicals: { select: showSelect },
                  plays: { select: showSelect },
                },
              },
            },
          },
        },
      },
    },
  });
  if (follows.length === 0) return [];

  const theatreIds = follows.map((f) => f.theatres.id);
  // The viewer's own visits at these theatres. Legacy rows keep the theatre and date on the
  // performance row; normalising unifies the two shapes.
  const rows = await prisma.attendance.findMany({
    where: {
      user: userId,
      OR: [{ theatre: { in: theatreIds } }, { performances: { theatre: { in: theatreIds } } }],
    },
    include: attendanceInclude,
  });
  const visits = normalizeAttendanceRows(rows)
    .filter((v) => !v.isUpcoming && v.performances.startTime.getTime() > 0)
    .map((v) => ({
      programming: v.programming,
      theatreId: v.performances.theatre,
      // Normalised rows carry the calendar day, whether logged by date or by showtime.
      date: v.performances.startTime,
    }));

  const now = new Date();
  return follows.map((f) =>
    buildHomeTheatreCard(
      {
        id: f.theatres.id,
        name: f.theatres.name,
        location: f.theatres.location,
        image: f.theatres.image,
        seasons: f.theatres.seasons.map((s) => ({
          id: s.id,
          name: s.name,
          startDate: s.startDate,
          endDate: s.endDate,
          runs: s.programming.flatMap((p) => {
            const show = p.type === "MUSICAL" ? p.musicals : p.plays;
            // Shows a member added stay off the card until an admin approves them.
            if (!show || show.status !== "APPROVED") return [];
            return [
              {
                id: p.id,
                type: p.type,
                title: show.title,
                playbill: show.playbill,
                startDate: p.startDate,
                endDate: p.endDate,
              },
            ];
          }),
        })),
      },
      visits,
      now
    )
  );
}
