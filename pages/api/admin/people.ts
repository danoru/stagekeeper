import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";

import {
  getAdminPerson,
  getSamePersonSuggestions,
  mergePeople,
  searchAdminPeople,
  splitPerson,
  updatePersonNaming,
} from "../../../src/data/peopleAdmin";
import { authOptions } from "../auth/[...nextauth]";

function text(value: unknown, max = 120): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.replace(/\s+/g, " ").trim().slice(0, max);
  return trimmed || null;
}

// Admin people tools.
//   GET ?suggestions=1        → "same person?" pairs
//   GET ?q=name               → search
//   GET ?id=12                → one person with every credit
//   POST { action: "merge", fromId, intoId }
//   POST { action: "split", personId, creditIds, name, disambiguator? }
//   PATCH { id, name?, disambiguator? }
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session || session.user.badge !== "ADMIN") {
    return res.status(403).json({ error: "Forbidden." });
  }

  if (req.method === "GET") {
    if (req.query.suggestions) {
      return res.status(200).json({ pairs: await getSamePersonSuggestions() });
    }
    if (typeof req.query.q === "string") {
      return res.status(200).json({ people: await searchAdminPeople(req.query.q) });
    }
    const id = Number(req.query.id);
    if (!Number.isInteger(id)) return res.status(400).json({ error: "id, q or suggestions." });
    const person = await getAdminPerson(id);
    if (!person) return res.status(404).json({ error: "Person not found." });
    return res.status(200).json({ person });
  }

  if (req.method === "POST") {
    const action = req.body?.action;
    try {
      if (action === "merge") {
        const fromId = Number(req.body?.fromId);
        const intoId = Number(req.body?.intoId);
        if (!Number.isInteger(fromId) || !Number.isInteger(intoId)) {
          return res.status(400).json({ error: "fromId and intoId are required." });
        }
        return res.status(200).json(await mergePeople(fromId, intoId));
      }
      if (action === "split") {
        const personId = Number(req.body?.personId);
        const creditIds = Array.isArray(req.body?.creditIds)
          ? req.body.creditIds.map(Number).filter(Number.isInteger)
          : [];
        const name = text(req.body?.name);
        if (!Number.isInteger(personId) || !name || name.length < 2) {
          return res.status(400).json({ error: "Give the new person a name." });
        }
        const created = await splitPerson({
          personId,
          creditIds,
          name,
          disambiguator: text(req.body?.disambiguator, 60),
        });
        return res.status(200).json({ person: created });
      }
      return res.status(400).json({ error: "action must be merge or split." });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed.";
      return res.status(400).json({ error: message });
    }
  }

  if (req.method === "PATCH") {
    const id = Number(req.body?.id);
    if (!Number.isInteger(id)) return res.status(400).json({ error: "id is required." });
    const data: { name?: string; disambiguator?: string | null } = {};
    if (req.body?.name !== undefined) {
      const name = text(req.body.name);
      if (!name || name.length < 2) return res.status(400).json({ error: "Name is too short." });
      data.name = name;
    }
    if (req.body?.disambiguator !== undefined)
      data.disambiguator = text(req.body.disambiguator, 60);
    try {
      return res.status(200).json({ person: await updatePersonNaming(id, data) });
    } catch {
      return res.status(404).json({ error: "Person not found." });
    }
  }

  res.setHeader("Allow", ["GET", "POST", "PATCH"]);
  return res.status(405).json({ error: "Method not allowed." });
}
