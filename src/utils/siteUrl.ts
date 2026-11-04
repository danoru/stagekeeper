import type { NextApiRequest } from "next";

/**
 * Base URL for links we email out. Never built from the Host header in production: a forged
 * Host would send someone a working token pointing at another site. Null when unset there.
 */
export function emailLinkBase(req?: NextApiRequest): string | null {
  const configured = process.env.NEXTAUTH_URL;
  if (configured) return configured.replace(/\/$/, "");
  if (process.env.NODE_ENV === "production" || !req) return null;
  return `http://${req.headers.host}`;
}
