import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Link from "@mui/material/Link";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useState } from "react";

import AuthCard, { authFooterLinkSx, authFooterSx } from "./AuthCard";

function ForgotPasswordForm() {
  const [identifier, setIdentifier] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: identifier.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        return;
      }
      setDone(true);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthCard subtitle="We'll email you a reset link" title="Forgot Password">
      {done ? (
        <Alert severity="success" sx={{ mb: 2 }}>
          If that account exists, a reset link is on its way. Check your inbox (and spam folder).
        </Alert>
      ) : (
        <Box component="form" onSubmit={handleSubmit}>
          <Typography sx={{ fontSize: "0.85rem", color: "rgba(232,220,200,0.6)", mb: 1 }}>
            Enter your username or the email you signed up with.
          </Typography>
          <TextField
            autoFocus
            fullWidth
            required
            autoComplete="username"
            label="Username or email"
            margin="normal"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
          />
          {error && (
            <Typography sx={{ color: "#E57373", fontSize: "0.8rem", mt: 1 }}>{error}</Typography>
          )}
          <Button
            fullWidth
            disabled={submitting || !identifier.trim()}
            sx={{ mt: 2, mb: 2.5, py: 1.25, fontSize: "0.75rem", letterSpacing: "0.1em" }}
            type="submit"
            variant="contained"
          >
            {submitting ? "Sending…" : "Send Reset Link"}
          </Button>
        </Box>
      )}
      <Box sx={authFooterSx}>
        <Link href="/login" sx={authFooterLinkSx} underline="none">
          Back to sign in
        </Link>
      </Box>
    </AuthCard>
  );
}

export default ForgotPasswordForm;
