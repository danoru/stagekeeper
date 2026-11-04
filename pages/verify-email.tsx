import { Alert, Button, CircularProgress, Container, Stack, Typography } from "@mui/material";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

type State = "checking" | "confirmed" | "failed";

// The link in a verification email lands here, and the page confirms it. Doing that from the
// browser rather than on page load means mail scanners that fetch links don't use it up.
function VerifyEmailPage() {
  const router = useRouter();
  const [state, setState] = useState<State>("checking");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!router.isReady) return;
    const token = router.query.token;
    if (typeof token !== "string") {
      setError("This link is missing its code.");
      setState("failed");
      return;
    }
    fetch("/api/auth/verify-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    })
      .then(async (res) => {
        if (res.ok) {
          setState("confirmed");
          return;
        }
        const body = await res.json().catch(() => ({}));
        setError(body.error ?? "Couldn't confirm your email.");
        setState("failed");
      })
      .catch(() => {
        setError("Couldn't reach StageKeeper. Try the link again.");
        setState("failed");
      });
  }, [router.isReady, router.query.token]);

  return (
    <Container maxWidth="sm" sx={{ py: 6 }}>
      <Head>
        <title>Confirm your email • StageKeeper</title>
      </Head>
      <Stack alignItems="center" spacing={2}>
        <Typography component="h1" variant="h5">
          Confirm your email
        </Typography>
        {state === "checking" && <CircularProgress size={28} />}
        {state === "confirmed" && (
          <Alert severity="success">Your email is confirmed. Thanks!</Alert>
        )}
        {state === "failed" && (
          <>
            <Alert severity="error">{error}</Alert>
            <Typography color="text.secondary" variant="body2">
              Sign in and use the banner at the top of the page to get a new link.
            </Typography>
          </>
        )}
        {state !== "checking" && (
          <Button href="/" variant="outlined">
            Go to StageKeeper
          </Button>
        )}
      </Stack>
    </Container>
  );
}

export default VerifyEmailPage;
