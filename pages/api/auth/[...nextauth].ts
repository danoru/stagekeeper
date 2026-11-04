import { compare } from "bcrypt";
import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

import prisma from "../../../src/data/db";
import { clientIp, rateLimit } from "../../../src/utils/rateLimit";

// How long a session may go before its badge and validity are re-read from the DB.
const SESSION_REFRESH_MS = 5 * 60 * 1000;

const SESSION_REVOKED = "Session revoked.";

export const authOptions: NextAuthOptions = {
  logger: {
    // A revoked session is routine, not worth a stack trace in the logs.
    error(code, metadata) {
      if ((metadata as { message?: string })?.message === SESSION_REVOKED) return;
      console.error(`[next-auth][error][${code}]`, metadata);
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 24 * 7,
  },
  pages: {
    error: "/login",
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        const ip = clientIp({ headers: req.headers ?? {} });
        // Per account as well as per address, so guessing one password from many IPs is capped.
        const account = (credentials?.username ?? "").toLowerCase();
        const allowed =
          (await rateLimit(`login:${ip}`, 20, 15 * 60 * 1000)) &&
          (await rateLimit(`login-user:${account}`, 10, 15 * 60 * 1000));
        if (!allowed) {
          throw new Error("Too many sign-in attempts. Try again in a few minutes.");
        }

        try {
          const user = await prisma.users.findUnique({
            where: {
              username: credentials?.username,
            },
          });

          if (!user) {
            return null;
          }

          const passwordCorrect = await compare(credentials?.password || "", user.password || "");

          if (passwordCorrect) {
            return {
              id: user.id.toString(),
              username: user.username,
              badge: user.badge,
              passwordChangedAt: user.passwordChangedAt?.getTime() ?? 0,
            };
          } else {
            return null;
          }
        } catch (error) {
          console.error("Error during authentication:", error);
          return null;
        }
      },
    }),
  ],

  callbacks: {
    async session({ session, token }) {
      if (token.user) {
        session.user = token.user;
      }
      return session;
    },
    async jwt({ token, user }: { token: any; user?: any }) {
      if (user) {
        const { passwordChangedAt, ...sessionUser } = user;
        token.user = sessionUser;
        token.passwordChangedAt = passwordChangedAt ?? 0;
        token.badgeCheckedAt = Date.now();
        return token;
      }

      // Badge changes (promote/demote in /admin/users) must not wait for the 7-day token to
      // expire, and neither should a password change or a deleted account, so re-read them.
      const checkedAt = typeof token.badgeCheckedAt === "number" ? token.badgeCheckedAt : 0;
      if (token.user && Date.now() - checkedAt > SESSION_REFRESH_MS) {
        let fresh;
        try {
          fresh = await prisma.users.findUnique({
            where: { id: Number(token.user.id) },
            select: { badge: true, username: true, passwordChangedAt: true },
          });
        } catch (error) {
          // A database blip shouldn't sign everyone out; check again next time.
          console.error("Failed to refresh session:", error);
          return token;
        }
        const changedAt = fresh?.passwordChangedAt?.getTime() ?? 0;
        // next-auth clears the session cookie when this callback throws.
        if (!fresh || changedAt !== (token.passwordChangedAt ?? 0)) {
          throw new Error(SESSION_REVOKED);
        }
        token.user = { ...token.user, badge: fresh.badge, username: fresh.username };
        token.badgeCheckedAt = Date.now();
      }
      return token;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export default NextAuth(authOptions);
