import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";

import { getPendingContent, mergeShow, mergeTheatre } from "../../../src/data/catalog";
import prisma from "../../../src/data/db";
import { authOptions } from "../auth/[...nextauth]";

async function requireAdmin(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session || session.user.badge !== "ADMIN") {
    res.status(403).json({ error: "Forbidden." });
    return null;
  }
  return session;
}

type Kind = "MUSICAL" | "PLAY" | "THEATRE";

// Admin queue for user-submitted shows and theatres.
//   GET    → everything still PENDING
//   PATCH  { kind, id, action: "approve" } | { kind, id, action: "merge", intoId }
//   DELETE { kind, id } — only when nothing references it
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const admin = await requireAdmin(req, res);
  if (!admin) return;

  if (req.method === "GET") {
    return res.status(200).json(await getPendingContent());
  }

  const { kind, id } = (req.body ?? {}) as { kind?: Kind; id?: number };
  const targetId = Number(id);
  if (!["MUSICAL", "PLAY", "THEATRE"].includes(kind as string) || !Number.isFinite(targetId)) {
    return res.status(400).json({ error: "kind and id are required." });
  }

  if (req.method === "PATCH") {
    const { action, intoId } = req.body ?? {};
    try {
      if (action === "approve") {
        if (kind === "MUSICAL")
          await prisma.musicals.update({ where: { id: targetId }, data: { status: "APPROVED" } });
        else if (kind === "PLAY")
          await prisma.plays.update({ where: { id: targetId }, data: { status: "APPROVED" } });
        else
          await prisma.theatres.update({ where: { id: targetId }, data: { status: "APPROVED" } });
        return res.status(200).json({ message: "Approved." });
      }
      if (action === "merge") {
        const into = Number(intoId);
        if (!Number.isFinite(into)) return res.status(400).json({ error: "intoId is required." });
        if (kind === "THEATRE") await mergeTheatre(targetId, into);
        else await mergeShow(kind as "MUSICAL" | "PLAY", targetId, into);
        return res.status(200).json({ message: "Merged." });
      }
      return res.status(400).json({ error: "action must be approve or merge." });
    } catch (e) {
      console.error(e);
      return res.status(500).json({ error: (e as Error).message || "Failed." });
    }
  }

  if (req.method === "DELETE") {
    try {
      if (kind === "MUSICAL") await prisma.musicals.delete({ where: { id: targetId } });
      else if (kind === "PLAY") await prisma.plays.delete({ where: { id: targetId } });
      else await prisma.theatres.delete({ where: { id: targetId } });
      return res.status(200).json({ message: "Deleted." });
    } catch (e: any) {
      if (e?.code === "P2003") {
        return res
          .status(409)
          .json({ error: "Still referenced by logs or watchlists — merge it instead." });
      }
      console.error(e);
      return res.status(500).json({ error: "Failed to delete." });
    }
  }

  res.setHeader("Allow", ["GET", "PATCH", "DELETE"]);
  return res.status(405).json({ error: `Method ${req.method} not allowed.` });
}
