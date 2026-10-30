import { mean } from "../utils/ratings";
import { theatreToday } from "../utils/schedule";

import prisma from "./db";
import { getGoingVisibleIds } from "./privacy";

export interface FriendSeen {
  username: string;
  image: string | null;
  rating: number | null;
  visits: number;
  lastSeen: string | null;
}

export interface FriendGoing {
  username: string;
  image: string | null;
  date: string;
}

export interface ShowSummary {
  community: {
    average: number | null;
    raters: number;
    seenBy: number;
    watchlisted: number;
    /** People per half-star (index 0 = ½★ … 9 = 5★), from each person's mean rating. */
    histogram: number[];
  };
  friends: { seen: FriendSeen[]; going: FriendGoing[] };
}

function histogramOf(perPerson: number[]): number[] {
  const buckets = Array<number>(10).fill(0);
  for (const r of perPerson) {
    const halfStars = Math.min(10, Math.max(1, Math.round(r * 2)));
    buckets[halfStars - 1] += 1;
  }
  return buckets;
}

type ShowRef = { musical: number } | { play: number };

/**
 * Audience stats for a show page. The community average averages each person's mean rating,
 * so someone who logged a show six times still counts once.
 */
export async function getShowSummary(show: ShowRef, viewerId: number | null): Promise<ShowSummary> {
  const forShow = { OR: [show, { performances: show }] };
  const today = theatreToday();
  // A "going" row counts as a viewing once its date has passed.
  const happened = { OR: [{ going: false }, { seenDate: { lt: today } }] };

  const [rated, viewers, watchlisted] = await Promise.all([
    prisma.attendance.groupBy({
      by: ["user"],
      where: { AND: [forShow, { rating: { not: null } }] },
      _avg: { rating: true },
    }),
    prisma.attendance.groupBy({
      by: ["user"],
      where: { AND: [forShow, happened] },
    }),
    prisma.watchlist.count({ where: show }),
  ]);

  const perPerson = rated
    .map((r) => (r._avg.rating == null ? null : Number(r._avg.rating)))
    .filter((v): v is number => v != null);

  const summary: ShowSummary = {
    community: {
      average: mean(perPerson),
      raters: perPerson.length,
      seenBy: viewers.length,
      watchlisted,
      histogram: histogramOf(perPerson),
    },
    friends: { seen: [], going: [] },
  };
  if (viewerId == null) return summary;

  const following = await prisma.following.findMany({
    where: { user: viewerId },
    select: { followingUsername: true },
  });
  if (following.length === 0) return summary;

  const friends = await prisma.users.findMany({
    where: { username: { in: following.map((f) => f.followingUsername) } },
    select: { id: true, username: true, image: true },
  });
  if (friends.length === 0) return summary;

  const rows = await prisma.attendance.findMany({
    where: { AND: [forShow, { user: { in: friends.map((f) => f.id) } }] },
    select: {
      user: true,
      rating: true,
      seenDate: true,
      going: true,
      performances: { select: { startTime: true } },
    },
  });

  const byId = new Map(friends.map((f) => [f.id, f]));
  const seen = new Map<number, { ratings: number[]; visits: number; last: Date | null }>();
  // Going dates are only shared with mutual follows and groupmates (see privacy.ts).
  const visible = await getGoingVisibleIds(viewerId);

  for (const row of rows) {
    const friend = row.user != null ? byId.get(row.user) : undefined;
    if (!friend) continue;
    const date = row.seenDate ?? row.performances?.startTime ?? null;
    if (row.going && date && date >= today) {
      if (!visible.has(friend.id)) continue;
      summary.friends.going.push({
        username: friend.username,
        image: friend.image,
        date: date.toISOString(),
      });
      continue;
    }
    const entry = seen.get(friend.id) ?? { ratings: [], visits: 0, last: null };
    entry.visits += 1;
    if (row.rating != null) entry.ratings.push(Number(row.rating));
    if (date && (!entry.last || date > entry.last)) entry.last = date;
    seen.set(friend.id, entry);
  }

  summary.friends.seen = [...seen.entries()]
    .map(([id, entry]) => ({
      username: byId.get(id)!.username,
      image: byId.get(id)!.image,
      rating: mean(entry.ratings),
      visits: entry.visits,
      lastSeen: entry.last?.toISOString() ?? null,
    }))
    .sort((a, b) => (b.lastSeen ?? "").localeCompare(a.lastSeen ?? ""));
  summary.friends.going.sort((a, b) => a.date.localeCompare(b.date));

  return summary;
}
