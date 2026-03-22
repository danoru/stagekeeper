import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      username: string;
      badge: "ADMIN" | "PATRON" | "USER";
    } & DefaultSession["user"];
  }
}
