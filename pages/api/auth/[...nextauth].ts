import { compare } from "bcrypt";
import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

import prisma from "../../../src/data/db";
import { clientIp, rateLimit } from "../../../src/utils/rateLimit";

// How long a signed-in user's badge may be stale before we re-read it from the DB.
const BADGE_REFRESH_MS = 5 * 60 * 1000;

export const authOptions: NextAuthOptions = {
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
        if (!rateLimit(`login:${ip}`, 20, 15 * 60 * 1000)) {
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
        token.user = user;
        token.badgeCheckedAt = Date.now();
        return token;
      }

      // Badge changes (promote/demote in /admin/users) must not wait for the 7-day
      // token to expire, so periodically re-read it.
      const checkedAt = typeof token.badgeCheckedAt === "number" ? token.badgeCheckedAt : 0;
      if (token.user && Date.now() - checkedAt > BADGE_REFRESH_MS) {
        try {
          const fresh = await prisma.users.findUnique({
            where: { id: Number(token.user.id) },
            select: { badge: true, username: true },
          });
          if (fresh) {
            token.user = { ...token.user, badge: fresh.badge, username: fresh.username };
          }
        } catch (error) {
          console.error("Failed to refresh badge:", error);
        }
        token.badgeCheckedAt = Date.now();
      }
      return token;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export default NextAuth(authOptions);
