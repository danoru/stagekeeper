import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Link from "@mui/material/Link";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useState } from "react";

import { PASSWORD_MIN_LENGTH } from "../../utils/validation";

import AuthCard, { authFooterLinkSx, authFooterSx } from "./AuthCard";

interface Props {
  token: string;
}

function ResetPasswordForm({ token }: Props) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mismatch = confirm.length > 0 && confirm !== password;
  const tooShort = password.length > 0 && password.length < PASSWORD_MIN_LENGTH;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (mismatch || tooShort) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
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
    <AuthCard subtitle="Choose a new password" title="Reset Password">
      {done ? (
        <Alert severity="success" sx={{ mb: 2 }}>
          Your password has been updated. You can sign in now.
        </Alert>
      ) : (
        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            autoFocus
            fullWidth
            required
            autoComplete="new-password"
            error={tooShort}
            helperText={tooShort ? `At least ${PASSWORD_MIN_LENGTH} characters.` : undefined}
            label="New password"
            margin="normal"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <TextField
            fullWidth
            required
            autoComplete="new-password"
            error={mismatch}
            helperText={mismatch ? "Passwords must match." : undefined}
            label="Confirm new password"
            margin="normal"
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
          {error && (
            <Typography sx={{ color: "#E57373", fontSize: "0.8rem", mt: 1 }}>{error}</Typography>
          )}
          <Button
            fullWidth
            disabled={submitting || !password || mismatch || tooShort}
            sx={{ mt: 2, mb: 2.5, py: 1.25, fontSize: "0.75rem", letterSpacing: "0.1em" }}
            type="submit"
            variant="contained"
          >
            {submitting ? "Saving…" : "Set New Password"}
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

export default ResetPasswordForm;
