import type { users } from "@prisma/client";

// Only what authorize() puts in the token; the full row (email, password hash) never is.
export type SessionUser = Pick<users, "id" | "username" | "badge">;

declare module "next-auth" {
  interface Session {
    user: SessionUser;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    user: SessionUser;
  }
}
