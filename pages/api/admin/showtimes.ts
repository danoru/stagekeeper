import type { PerformanceStatus } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";

import {
  addShowtime,
  generateFromPattern,
  getRunShowtimes,
  removeShowtime,
  ShowtimeError,
  updateShowtime,
} from "../../../src/data/showtimes";
import { authOptions } from "../auth/[...nextauth]";

const STATUSES: PerformanceStatus[] = ["SCHEDULED", "CANCELED", "SOLD_OUT"];

function positiveInt(value: unknown): number | null {
  const n = Number(value);
  return Number.isInteger(n) && n > 0 ? n : null;
}

function labelFrom(value: unknown): string | null {
  if (typeof value !== "string") return null;
  return value.replace(/\s+/g, " ").trim().slice(0, 60) || null;
}

// Real showtimes for one run.
//   GET    ?programmingId=
//   POST   { programmingId, action: "generate" } | { programmingId, date, time, label? }
//   PATCH  { id, status?, label? }
//   DELETE { id }
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session || session.user.badge !== "ADMIN") {
    return res.status(403).json({ error: "Forbidden." });
  }

  try {
    if (req.method === "GET") {
      const programmingId = positiveInt(req.query.programmingId);
      if (!programmingId) return res.status(400).json({ error: "programmingId is required." });
      return res.status(200).json(await getRunShowtimes(programmingId));
    }

    if (req.method === "POST") {
      const programmingId = positiveInt(req.body?.programmingId);
      if (!programmingId) return res.status(400).json({ error: "programmingId is required." });
      if (req.body?.action === "generate") {
        const count = await generateFromPattern(programmingId);
        return res.status(200).json({ message: `Created ${count} showtimes.` });
      }
      await addShowtime(
        programmingId,
        String(req.body?.date ?? ""),
        String(req.body?.time ?? ""),
        labelFrom(req.body?.label)
      );
      return res.status(201).json({ message: "Showtime added." });
    }

    if (req.method === "PATCH") {
      const id = positiveInt(req.body?.id);
      if (!id) return res.status(400).json({ error: "id is required." });
      const status = req.body?.status as PerformanceStatus | undefined;
      if (status !== undefined && !STATUSES.includes(status)) {
        return res.status(400).json({ error: "Invalid status." });
      }
      await updateShowtime(id, {
        status,
        label: req.body?.label === undefined ? undefined : labelFrom(req.body.label),
      });
      return res.status(200).json({ message: "Saved." });
    }

    if (req.method === "DELETE") {
      const id = positiveInt(req.body?.id);
      if (!id) return res.status(400).json({ error: "id is required." });
      const result = await removeShowtime(id);
      return res.status(200).json({
        message:
          result === "deleted" ? "Removed." : "People logged this one, so it's marked canceled.",
      });
    }
  } catch (e) {
    if (e instanceof ShowtimeError) return res.status(400).json({ error: e.message });
    console.error(e);
    return res.status(500).json({ error: "Something went wrong." });
  }

  res.setHeader("Allow", ["GET", "POST", "PATCH", "DELETE"]);
  return res.status(405).json({ error: `Method ${req.method} not allowed.` });
}
