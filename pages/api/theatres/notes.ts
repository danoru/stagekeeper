import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";

import prisma from "../../../src/data/db";
import { isEmailVerified, VERIFY_EMAIL_MESSAGE } from "../../../src/data/emailVerification";
import { MAX_NOTE_LENGTH, NOTE_CATEGORIES } from "../../../src/data/houseRecord";
import { rateLimit } from "../../../src/utils/rateLimit";
import { authOptions } from "../auth/[...nextauth]";

// Theatre tips ("know before you go").
//   POST   { theatreId, category, text } — members with a visit there; held for an admin
//   PUT    { noteId } — mark helpful        DELETE { noteId } — take the vote back
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).json({ error: "Not authenticated." });
  const userId = Number(session.user.id);
  const isAdmin = session.user.badge === "ADMIN";

  if (req.method === "POST") {
    if (!isAdmin && !(await isEmailVerified(userId))) {
      return res.status(403).json({ error: VERIFY_EMAIL_MESSAGE });
    }
    if (!isAdmin && !(await rateLimit(`theatre-note:${userId}`, 10, 24 * 60 * 60 * 1000))) {
      return res.status(429).json({ error: "That's a lot of tips for one day. Try tomorrow." });
    }
    const theatreId = Number(req.body?.theatreId);
    const category = req.body?.category;
    const text =
      typeof req.body?.text === "string" ? req.body.text.replace(/\s+/g, " ").trim() : "";
    if (!Number.isInteger(theatreId)) return res.status(400).json({ error: "Invalid theatre." });
    if (!NOTE_CATEGORIES.includes(category)) {
      return res.status(400).json({ error: "Pick a category." });
    }
    if (text.length < 10 || text.length > MAX_NOTE_LENGTH) {
      return res.status(400).json({ error: `Tips are 10 to ${MAX_NOTE_LENGTH} characters.` });
    }
    if (!isAdmin) {
      const visit = await prisma.attendance.findFirst({
        where: {
          user: userId,
          going: false,
          OR: [{ theatre: theatreId }, { performances: { theatre: theatreId } }],
        },
        select: { id: true },
      });
      if (!visit) {
        return res.status(403).json({ error: "Log a visit to this theatre to add a tip." });
      }
    }
    const theatre = await prisma.theatres.findFirst({
      where: { id: theatreId, status: "APPROVED" },
      select: { id: true },
    });
    if (!theatre) return res.status(404).json({ error: "Theatre not found." });
    const note = await prisma.theatreNotes.create({
      data: {
        theatre: theatreId,
        user: userId,
        category,
        text,
        status: isAdmin ? "APPROVED" : "PENDING",
      },
      select: { id: true, status: true },
    });
    return res.status(201).json({ note });
  }

  if (req.method === "PUT" || req.method === "DELETE") {
    const noteId = Number(req.body?.noteId);
    if (!Number.isInteger(noteId)) return res.status(400).json({ error: "Invalid tip." });
    if (req.method === "DELETE") {
      await prisma.theatreNoteVotes.deleteMany({ where: { note: noteId, user: userId } });
      return res.status(200).json({ message: "Vote removed." });
    }
    const note = await prisma.theatreNotes.findFirst({
      where: { id: noteId, status: "APPROVED" },
      select: { user: true },
    });
    if (!note) return res.status(404).json({ error: "Tip not found." });
    if (note.user === userId) return res.status(400).json({ error: "That's your own tip." });
    await prisma.theatreNoteVotes.upsert({
      where: { note_user: { note: noteId, user: userId } },
      create: { note: noteId, user: userId },
      update: {},
    });
    return res.status(200).json({ message: "Marked helpful." });
  }

  res.setHeader("Allow", ["POST", "PUT", "DELETE"]);
  return res.status(405).json({ error: "Method not allowed." });
}
