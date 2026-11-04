import { Alert, Button } from "@mui/material";
import { useState } from "react";

import type { AccountStatus } from "../../data/emailVerification";

interface Props {
  status: AccountStatus | null;
}

// Nudges signed-in members with an unconfirmed email. Hidden when mail isn't configured, since
// verification isn't enforced then and no link could arrive. The navbar owns the status request.
function VerifyEmailBanner({ status }: Props) {
  const [notice, setNotice] = useState<{ text: string; ok: boolean } | null>(null);
  const [sending, setSending] = useState(false);

  if (!status?.required || status.verified) return null;

  async function resend() {
    setSending(true);
    try {
      const res = await fetch("/api/user/email-verification", { method: "POST" });
      const body = await res.json().catch(() => ({}));
      setNotice(
        res.ok
          ? { text: `Sent to ${status?.email}. Check your inbox.`, ok: true }
          : { text: body.error ?? "Couldn't send the email.", ok: false }
      );
    } finally {
      setSending(false);
    }
  }

  return (
    <Alert
      action={
        <Button color="inherit" disabled={sending} size="small" onClick={resend}>
          Resend link
        </Button>
      }
      severity={notice && !notice.ok ? "error" : "info"}
      sx={{ borderRadius: 0 }}
    >
      {notice?.text ??
        `Confirm your email (${status.email}) to add shows and theatres, suggest credits and invite people to groups.`}
    </Alert>
  );
}

export default VerifyEmailBanner;
