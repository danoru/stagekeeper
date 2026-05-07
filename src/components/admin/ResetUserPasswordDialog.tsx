import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";

type Props = {
  open: boolean;
  user: { id: number; username: string } | null;
  onClose: () => void;
  onSuccess: (username: string) => void;
  onError: (message: string) => void;
};

function generatePassword(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
  let out = "";
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  for (const byte of bytes) {
    out += alphabet[byte % alphabet.length];
  }
  return out;
}

function ResetUserPasswordDialog({ open, user, onClose, onSuccess, onError }: Props) {
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function reset() {
    setPassword("");
    setSubmitting(false);
    setCompleted(false);
    setCopied(false);
    setError(null);
  }

  function handleClose() {
    reset();
    onClose();
  }

  async function handleConfirm() {
    if (!user) return;
    if (password.length < 5) {
      setError("Password must be at least 5 characters long.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: user.id, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to reset password.");
        onError(data.error ?? "Failed to reset password.");
      } else {
        setCompleted(true);
        onSuccess(user.username);
      }
    } catch {
      const msg = "Network error. Please try again.";
      setError(msg);
      onError(msg);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(password);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // clipboard might be unavailable in some browsers/contexts; ignore
    }
  }

  return (
    <Dialog fullWidth open={open} maxWidth="xs" onClose={handleClose}>
      <DialogTitle>Reset password</DialogTitle>
      <DialogContent>
        {user && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Setting a new password for <strong>{user.username}</strong>.
          </Typography>
        )}
        {completed ? (
          <Alert severity="success" sx={{ mb: 1 }}>
            Password updated. Share the value below with the user — it won&apos;t be retrievable
            after you close this dialog.
          </Alert>
        ) : (
          <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1.5 }}>
            Type a password or generate one. The user can change it later from settings.
          </Typography>
        )}
        <Stack direction="row" spacing={1} alignItems="flex-start">
          <TextField
            fullWidth
            autoFocus={!completed}
            disabled={submitting}
            error={!!error}
            helperText={error}
            label="New password"
            size="small"
            type="text"
            value={password}
            InputProps={{
              readOnly: completed,
              endAdornment: password ? (
                <InputAdornment position="end">
                  <IconButton size="small" title="Copy" onClick={handleCopy}>
                    <Box
                      component="span"
                      sx={{ fontSize: "0.7rem", letterSpacing: "0.08em", color: "primary.main" }}
                    >
                      {copied ? "COPIED" : "COPY"}
                    </Box>
                  </IconButton>
                </InputAdornment>
              ) : undefined,
            }}
            onChange={(e) => {
              setPassword(e.target.value);
              setError(null);
            }}
          />
          {!completed && (
            <Button
              disabled={submitting}
              size="small"
              sx={{ flexShrink: 0, mt: 0.25 }}
              onClick={() => setPassword(generatePassword())}
            >
              Generate
            </Button>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        {completed ? (
          <Button variant="contained" onClick={handleClose}>
            Done
          </Button>
        ) : (
          <>
            <Button disabled={submitting} onClick={handleClose}>
              Cancel
            </Button>
            <Button
              disabled={submitting || password.length < 5}
              variant="contained"
              onClick={handleConfirm}
            >
              {submitting ? "Saving…" : "Reset password"}
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
}

export default ResetUserPasswordDialog;
