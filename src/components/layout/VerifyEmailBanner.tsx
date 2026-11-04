import { Alert, Button } from "@mui/material";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

interface Status {
  required: boolean;
  verified: boolean;
  email: string | null;
}

// Nudges signed-in members with an unconfirmed email. Hidden when mail isn't configured,
// since verification isn't enforced then and no link could arrive.
function VerifyEmailBanner() {
  const { data: session } = useSession();
  const router = useRouter();
  const [status, setStatus] = useState<Status | null>(null);
  const [notice, setNotice] = useState<{ text: string; ok: boolean } | null>(null);
  const [sending, setSending] = useState(false);
  const userId = session?.user?.id;

  useEffect(() => {
    if (!userId) {
      setStatus(null);
      return;
    }
    let cancelled = false;
    fetch("/api/user/email-verification")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!cancelled) setStatus(data);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
    // Refetched on navigation so changing an email in settings shows up straight away.
  }, [userId, router.asPath]);

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
