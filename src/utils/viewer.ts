import type { GetServerSidePropsContext } from "next";
import { getSession } from "next-auth/react";

/** Who's looking at a server-rendered page. */
export async function getViewer(context: GetServerSidePropsContext) {
  const session = await getSession(context);
  return {
    id: session ? Number(session.user.id) : null,
    isAdmin: session?.user.badge === "ADMIN",
  };
}
