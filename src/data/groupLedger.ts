import { buildLedger, type Ledger, type LedgerVisit } from "../utils/groupLedger";
import { theatreToday, visitDay } from "../utils/schedule";

import prisma from "./db";

/** Every member's past visits, for the group's ledger. Visits are public, so nothing new is shown. */
export async function getGroupLedgerVisits(memberIds: number[]): Promise<LedgerVisit[]> {
  if (memberIds.length < 2) return [];
  const rows = await prisma.attendance.findMany({
    where: {
      user: { in: memberIds },
      OR: [{ going: false }, { seenDate: { lt: theatreToday() } }],
    },
    select: {
      user: true,
      rating: true,
      seenDate: true,
      musicals: { select: { id: true, title: true } },
      plays: { select: { id: true, title: true } },
      performances: {
        select: {
          startTime: true,
          musicals: { select: { id: true, title: true } },
          plays: { select: { id: true, title: true } },
        },
      },
    },
  });
  return rows.flatMap((r) => {
    const musical = r.musicals ?? r.performances?.musicals ?? null;
    const play = r.plays ?? r.performances?.plays ?? null;
    const show = musical ?? play;
    const day = visitDay(r.seenDate, r.performances?.startTime);
    if (!show || !day || r.user == null) return [];
    return [
      {
        userId: r.user,
        showKey: `${musical ? "MUSICAL" : "PLAY"}-${show.id}`,
        title: show.title,
        day,
        rating: r.rating == null ? null : Number(r.rating),
      },
    ];
  });
}

export function getGroupLedger(visits: LedgerVisit[], year?: number): Ledger {
  return buildLedger(visits, year);
}
