import { randomBytes } from "crypto";

import type { NextApiRequest } from "next";

import { mailConfigured, sendMail } from "../utils/mail";
import { hashResetToken } from "../utils/resetToken";
import { emailLinkBase } from "../utils/siteUrl";

import prisma from "./db";

const TOKEN_TTL_MS = 48 * 60 * 60 * 1000;

export const VERIFY_EMAIL_MESSAGE = "Verify your email first. Check your inbox for the link.";

/**
 * Whether the user may do things other members see. Without outbound mail nobody could ever
 * receive a link, so verification isn't enforced until mail is configured.
 */
export async function isEmailVerified(userId: number): Promise<boolean> {
  if (!mailConfigured) return true;
  const user = await prisma.users.findUnique({
    where: { id: userId },
    select: { emailVerifiedAt: true },
  });
  return user?.emailVerifiedAt != null;
}

export interface AccountStatus {
  required: boolean;
  verified: boolean;
  email: string | null;
  pendingInvites: number;
}

export async function getAccountStatus(userId: number): Promise<AccountStatus> {
  const user = await prisma.users.findUnique({
    where: { id: userId },
    select: {
      email: true,
      emailVerifiedAt: true,
      _count: { select: { groupInvites: true } },
    },
  });
  return {
    required: mailConfigured,
    verified: user?.emailVerifiedAt != null,
    email: user?.email ?? null,
    pendingInvites: user?._count.groupInvites ?? 0,
  };
}

/** Sends a fresh link, replacing any earlier one. Never throws: signup shouldn't depend on it. */
export async function sendVerificationEmail(userId: number, req?: NextApiRequest) {
  try {
    const base = emailLinkBase(req);
    if (!base) {
      console.error("NEXTAUTH_URL is not set; refusing to send a verification link.");
      return false;
    }
    const token = randomBytes(32).toString("hex");
    const user = await prisma.users.update({
      where: { id: userId },
      data: {
        emailVerifyToken: hashResetToken(token),
        emailVerifyExpires: new Date(Date.now() + TOKEN_TTL_MS),
      },
      select: { email: true, username: true },
    });
    const link = `${base}/verify-email?token=${token}`;
    return await sendMail({
      to: user.email,
      subject: "Confirm your StageKeeper email",
      text: `Hi ${user.username},\n\nConfirm your email here (link expires in 48 hours):\n${link}\n\nIf you didn't sign up for StageKeeper, ignore this email.`,
      html: `<p>Hi ${user.username},</p><p><a href="${link}">Confirm your email</a> (link expires in 48 hours).</p><p>If you didn't sign up for StageKeeper, ignore this email.</p>`,
    });
  } catch (error) {
    console.error("Failed to send verification email:", error);
    return false;
  }
}

/** Returns true when the token matched a live link; the link can't be used twice. */
export async function confirmEmail(token: string): Promise<boolean> {
  const updated = await prisma.users.updateMany({
    where: { emailVerifyToken: hashResetToken(token), emailVerifyExpires: { gt: new Date() } },
    data: { emailVerifiedAt: new Date(), emailVerifyToken: null, emailVerifyExpires: null },
  });
  return updated.count > 0;
}
