import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  TextField,
} from "@mui/material";
import type { ReportTarget } from "@prisma/client";
import { useSession } from "next-auth/react";
import { useState } from "react";

import { REPORT_REASONS } from "../../utils/reportReasons";

interface Props {
  targetType: ReportTarget;
  targetId: number;
}

// Small link at the bottom of a page. Hidden when signed out, since reports come from members.
function ReportButton({ targetType, targetId }: Props) {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  if (!session) return null;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    setError(null);
    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetType, targetId, reason, details }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(body.error ?? "Couldn't send the report.");
        return;
      }
      setSent(true);
    } finally {
      setSending(false);
    }
  }

  function close() {
    setOpen(false);
    setSent(false);
    setReason("");
    setDetails("");
    setError(null);
  }

  return (
    <Box sx={{ px: { xs: 2, md: 4 }, pb: 3, textAlign: "right" }}>
      <Button
        size="small"
        sx={{ color: "rgba(232,220,200,0.45)", fontSize: "0.7rem", textTransform: "none" }}
        onClick={() => setOpen(true)}
      >
        Report a problem
      </Button>
      <Dialog fullWidth maxWidth="xs" open={open} onClose={close}>
        <Box component="form" onSubmit={submit}>
          <DialogTitle>Report a problem</DialogTitle>
          <DialogContent>
            {sent ? (
              <Alert severity="success">Thanks. An admin will take a look.</Alert>
            ) : (
              <Stack spacing={2} sx={{ pt: 1 }}>
                <TextField
                  required
                  select
                  label="What's wrong?"
                  size="small"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                >
                  {REPORT_REASONS.map((r) => (
                    <MenuItem key={r} value={r}>
                      {r}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  multiline
                  inputProps={{ maxLength: 500 }}
                  label="Anything else we should know? (optional)"
                  minRows={3}
                  size="small"
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                />
                {error && <Alert severity="error">{error}</Alert>}
              </Stack>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={close}>{sent ? "Close" : "Cancel"}</Button>
            {!sent && (
              <Button disabled={sending || !reason} type="submit" variant="contained">
                Send Report
              </Button>
            )}
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  );
}

export default ReportButton;
