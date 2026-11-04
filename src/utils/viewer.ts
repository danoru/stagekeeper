import type { GetServerSidePropsContext } from "next";
import { getServerSession } from "next-auth";

import { authOptions } from "../../pages/api/auth/[...nextauth]";

/**
 * The session for a server-rendered page. Reads the cookie directly; next-auth's client-side
 * getSession() would make the server send an HTTP request to itself on every page load.
 */
export function getViewerSession(context: Pick<GetServerSidePropsContext, "req" | "res">) {
  return getServerSession(context.req, context.res, authOptions);
}

/** Who's looking at a server-rendered page. */
export async function getViewer(context: Pick<GetServerSidePropsContext, "req" | "res">) {
  const session = await getViewerSession(context);
  return {
    id: session ? Number(session.user.id) : null,
    isAdmin: session?.user.badge === "ADMIN",
  };
}
