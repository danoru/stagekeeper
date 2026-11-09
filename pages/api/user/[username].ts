import { compare } from "bcrypt";
import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import * as yup from "yup";

import prisma from "../../../src/data/db";
import { sendVerificationEmail } from "../../../src/data/emailVerification";
import { publicUserSelect } from "../../../src/data/users";
import { rateLimit } from "../../../src/utils/rateLimit";
import { authOptions } from "../auth/[...nextauth]";

const optionalText = (max: number) =>
  yup
    .string()
    .trim()
    .max(max, `Must be ${max} characters or fewer.`)
    .transform((v) => (v === "" ? null : v))
    .nullable();

const profileSchema = yup.object({
  firstName: optionalText(60),
  lastName: optionalText(60),
  email: yup.string().trim().email("Enter a valid email.").required("Email is required."),
  location: optionalText(100),
  // Stored as a full URL so it renders as a safe, clickable link.
  website: yup
    .string()
    .trim()
    .transform((v) => (v === "" ? null : v))
    .nullable()
    .test("http-url", "Website must start with http:// or https://", (v) => {
      if (v == null) return true;
      try {
        const url = new URL(v);
        return url.protocol === "http:" || url.protocol === "https:";
      } catch {
        return false;
      }
    }),
  bio: optionalText(500),
});

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { username } = req.query;

  if (req.method === "GET") {
    try {
      const user = await prisma.users.findUnique({
        where: { username: String(username) },
        select: publicUserSelect,
      });
      if (!user) return res.status(404).json({ error: "User not found." });
      res.setHeader("Cache-Control", "public, max-age=60, stale-while-revalidate=120");
      return res.status(200).json(user);
    } catch {
      return res.status(500).json({ error: "Error fetching user data." });
    }
  }

  if (req.method === "PUT") {
    const session = await getServerSession(req, res, authOptions);
    if (!session) {
      return res.status(401).json({ error: "Not authenticated." });
    }
    if (session.user.username.toLowerCase() !== String(username).toLowerCase()) {
      return res.status(403).json({ error: "Forbidden." });
    }

    try {
      const data = await profileSchema.validate(req.body, { stripUnknown: true });
      const userId = Number(session.user.id);
      const current = await prisma.users.findUnique({
        where: { id: userId },
        select: { email: true, password: true },
      });
      if (!current) return res.status(401).json({ error: "Not authenticated." });
      // A new address hasn't been confirmed yet, whatever the old one's status was.
      const emailChanged = current.email.toLowerCase() !== data.email.toLowerCase();
      if (emailChanged) {
        // Password resets go to this address, so a borrowed session mustn't be able to change it.
        if (!(await rateLimit(`email-change:${userId}`, 10, 15 * 60 * 1000))) {
          return res.status(429).json({ error: "Too many attempts. Try again later." });
        }
        const { currentPassword } = req.body ?? {};
        if (
          typeof currentPassword !== "string" ||
          !(await compare(currentPassword, current.password))
        ) {
          return res.status(403).json({ error: "Enter your current password to change email." });
        }
      }
      const updatedUser = await prisma.users.update({
        where: { id: userId },
        data: { ...data, ...(emailChanged ? { emailVerifiedAt: null } : {}) },
        select: publicUserSelect,
      });
      if (emailChanged) await sendVerificationEmail(userId, req);
      return res.status(200).json(updatedUser);
    } catch (e: any) {
      if (e instanceof yup.ValidationError) {
        return res.status(400).json({ error: e.errors.join(", ") });
      }
      if (e?.code === "P2002") {
        return res.status(409).json({ error: "That email is already in use." });
      }
      console.error(e);
      return res.status(500).json({ error: "Error updating user data." });
    }
  }

  res.setHeader("Allow", ["GET", "PUT"]);
  return res.status(405).json({ error: `Method ${req.method} is not allowed.` });
}

export default handler;
