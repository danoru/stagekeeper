import type { NextApiRequest } from "next";

import prisma from "../data/db";

// Fixed-window limiter backed by Postgres, because serverless instances don't share memory.

export function clientIp(req: NextApiRequest | { headers: Record<string, unknown> }) {
  const forwarded = req.headers["x-forwarded-for"];
  const raw = Array.isArray(forwarded) ? forwarded[0] : forwarded;
  if (typeof raw === "string" && raw.length > 0) return raw.split(",")[0].trim();
  const realIp = req.headers["x-real-ip"];
  if (typeof realIp === "string" && realIp.length > 0) return realIp;
  return (req as NextApiRequest).socket?.remoteAddress ?? "unknown";
}

/**
 * Returns true when `key` is still within `limit` hits per `windowMs`; false once exceeded.
 * A database failure allows the request: limits shouldn't take the site down with them, and
 * every limited route needs the database anyway.
 */
export async function rateLimit(key: string, limit: number, windowMs: number): Promise<boolean> {
  const resetAt = new Date(Date.now() + windowMs);
  try {
    const rows = await prisma.$queryRaw<{ count: number }[]>`
      INSERT INTO "rateLimits" ("key", "count", "resetAt")
      VALUES (${key}, 1, ${resetAt}::timestamptz)
      ON CONFLICT ("key") DO UPDATE SET
        "count" = CASE WHEN "rateLimits"."resetAt" <= now() THEN 1
                       ELSE "rateLimits"."count" + 1 END,
        "resetAt" = CASE WHEN "rateLimits"."resetAt" <= now() THEN EXCLUDED."resetAt"
                         ELSE "rateLimits"."resetAt" END
      RETURNING "count"`;
    // Expired rows are overwritten when their key returns; sweep the rest now and then.
    if (Math.random() < 0.01) {
      await prisma.rateLimits.deleteMany({ where: { resetAt: { lt: new Date() } } });
    }
    return Number(rows[0].count) <= limit;
  } catch (error) {
    console.error("Rate limit check failed:", error);
    return true;
  }
}
