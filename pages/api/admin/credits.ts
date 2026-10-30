import type { CreditCategory } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";

import prisma from "../../../src/data/db";
import { CREDIT_CATEGORIES, createPersonSlug, getPendingCredits } from "../../../src/data/people";
import { authOptions } from "../auth/[...nextauth]";

async function requireAdmin(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session || session.user.badge !== "ADMIN") {
    res.status(403).json({ error: "Forbidden." });
    return null;
  }
  return session;
}

function text(value: unknown): string | null | undefined {
  if (value === undefined) return undefined;
  if (typeof value !== "string") return null;
  const trimmed = value.replace(/\s+/g, " ").trim().slice(0, 120);
  return trimmed || null;
}

// Removes a PENDING person once nothing credits them, so rejected typos don't linger.
async function dropOrphan(personId: number) {
  await prisma.people.deleteMany({
    where: { id: personId, status: "PENDING", credits: { none: {} } },
  });
}

// Admin queue for suggested credits.
//   GET    → pending credits grouped by production
//   PATCH  { ids: number[], action: "approve" } — also approves their people
//          { id, action: "edit", name?, character?, role?, category? }
//   DELETE { ids: number[] } — reject
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const admin = await requireAdmin(req, res);
  if (!admin) return;

  if (req.method === "GET") {
    return res.status(200).json(await getPendingCredits());
  }

  const ids: number[] = (Array.isArray(req.body?.ids) ? req.body.ids : [req.body?.id])
    .map(Number)
    .filter((n: number) => Number.isInteger(n) && n > 0);

  if (req.method === "PATCH") {
    const { action } = req.body ?? {};

    if (action === "approve") {
      if (ids.length === 0) return res.status(400).json({ error: "ids are required." });
      const credits = await prisma.credits.findMany({
        where: { id: { in: ids } },
        select: { person: true },
      });
      await prisma.$transaction([
        prisma.credits.updateMany({ where: { id: { in: ids } }, data: { status: "APPROVED" } }),
        prisma.people.updateMany({
          where: { id: { in: credits.map((c) => c.person) } },
          data: { status: "APPROVED" },
        }),
      ]);
      return res.status(200).json({ message: "Approved." });
    }

    if (action === "edit") {
      if (ids.length !== 1) return res.status(400).json({ error: "id is required." });
      const credit = await prisma.credits.findUnique({
        where: { id: ids[0] },
        select: { id: true, person: true, people: { select: { status: true } } },
      });
      if (!credit) return res.status(404).json({ error: "Credit not found." });

      const category = req.body?.category as CreditCategory | undefined;
      if (category !== undefined && !CREDIT_CATEGORIES.includes(category)) {
        return res.status(400).json({ error: "Invalid category." });
      }
      const name = text(req.body?.name);

      try {
        await prisma.$transaction(async (tx) => {
          if (name) {
            // Renaming a pending person fixes a typo. An approved person is shared by other
            // credits, so the credit moves to a person with the new name instead.
            if (credit.people.status === "PENDING") {
              await tx.people.update({
                where: { id: credit.person },
                data: { name, slug: await createPersonSlug(name, tx) },
              });
            } else {
              const target =
                (await tx.people.findFirst({
                  where: { name: { equals: name, mode: "insensitive" } },
                  select: { id: true },
                })) ??
                (await tx.people.create({
                  data: { name, slug: await createPersonSlug(name, tx), status: "PENDING" },
                  select: { id: true },
                }));
              await tx.credits.update({ where: { id: credit.id }, data: { person: target.id } });
            }
          }
          await tx.credits.update({
            where: { id: credit.id },
            data: {
              category,
              character: text(req.body?.character),
              role: text(req.body?.role),
            },
          });
        });
        await dropOrphan(credit.person);
        return res.status(200).json({ message: "Saved." });
      } catch (e) {
        console.error(e);
        return res.status(500).json({ error: "Failed to save." });
      }
    }

    return res.status(400).json({ error: "action must be approve or edit." });
  }

  if (req.method === "DELETE") {
    if (ids.length === 0) return res.status(400).json({ error: "ids are required." });
    const credits = await prisma.credits.findMany({
      where: { id: { in: ids } },
      select: { person: true },
    });
    await prisma.credits.deleteMany({ where: { id: { in: ids } } });
    for (const personId of new Set(credits.map((c) => c.person))) await dropOrphan(personId);
    return res.status(200).json({ message: "Rejected." });
  }

  res.setHeader("Allow", ["GET", "PATCH", "DELETE"]);
  return res.status(405).json({ error: `Method ${req.method} not allowed.` });
}
