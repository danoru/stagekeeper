import { createHash } from "crypto";

// Only the hash is stored, so a DB read can't be turned into a working reset link.
export function hashResetToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}
