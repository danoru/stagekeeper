import DeleteIcon from "@mui/icons-material/Delete";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useCallback, useEffect, useState } from "react";

import { formatTheatreTime } from "../../utils/schedule";

interface Showtime {
  id: number;
  startTime: string;
  status: "SCHEDULED" | "CANCELED" | "SOLD_OUT";
  label: string | null;
  _count: { attendance: number };
}

interface Data {
  hasPattern: boolean;
  patternCount: number;
  showtimes: Showtime[];
}

interface Props {
  programmingId: number;
  title: string;
  onClose: () => void;
}

const STATUS_LABELS = { SCHEDULED: "On", SOLD_OUT: "Sold out", CANCELED: "Canceled" };

function ShowtimesDialog({ programmingId, title, onClose }: Props) {
  const [data, setData] = useState<Data | null>(null);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [label, setLabel] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await fetch(`/api/admin/showtimes?programmingId=${programmingId}`);
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(body.error ?? "Failed to load showtimes.");
      return;
    }
    setData(body);
  }, [programmingId]);

  useEffect(() => {
    load();
  }, [load]);

  async function send(method: "POST" | "PATCH" | "DELETE", payload: object): Promise<boolean> {
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      const res = await fetch("/api/admin/showtimes", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(body.error ?? "Something went wrong.");
        return false;
      }
      setNotice(body.message ?? null);
      await load();
      return true;
    } finally {
      setBusy(false);
    }
  }

  function generate() {
    const existing = data?.showtimes.length ?? 0;
    if (
      existing > 0 &&
      !confirm("Rebuild from the weekly schedule? Canceled dates and labels will need redoing.")
    ) {
      return;
    }
    send("POST", { programmingId, action: "generate" });
  }

  async function add(e: React.FormEvent) {
    e.preventDefault();
    const ok = await send("POST", { programmingId, date, time, label });
    if (ok) {
      setTime("");
      setLabel("");
    }
  }

  return (
    <Dialog fullWidth open maxWidth="sm" onClose={onClose}>
      <DialogTitle>{`Showtimes · ${title}`}</DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ mb: 2 }}>
          Once a run has showtimes here, calendars use them instead of its weekly schedule. Times
          are as the clock reads at the theatre.
        </DialogContentText>

        {!data && !error && <CircularProgress size={24} />}

        {data && (
          <Stack spacing={2}>
            <Box>
              <Button
                disabled={busy || !data.hasPattern}
                size="small"
                variant="outlined"
                onClick={generate}
              >
                {data.hasPattern
                  ? `Build ${data.patternCount} from the weekly schedule`
                  : "Build from the weekly schedule"}
              </Button>
              {!data.hasPattern && (
                <Typography
                  color="text.secondary"
                  sx={{ display: "block", mt: 0.5 }}
                  variant="caption"
                >
                  This run has no weekly schedule yet. Edit the run to add one, or add showtimes
                  below.
                </Typography>
              )}
            </Box>

            <Box component="form" onSubmit={add}>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                <TextField
                  required
                  InputLabelProps={{ shrink: true }}
                  label="Date"
                  size="small"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
                <TextField
                  required
                  label="Time"
                  placeholder="8pm"
                  size="small"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                />
                <TextField
                  fullWidth
                  label="Label (optional)"
                  placeholder="Opening night"
                  size="small"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                />
                <Button disabled={busy} type="submit" variant="contained">
                  Add
                </Button>
              </Stack>
            </Box>

            {error && <Alert severity="error">{error}</Alert>}
            {notice && <Alert severity="success">{notice}</Alert>}

            <Divider />

            {data.showtimes.length === 0 ? (
              <Typography color="text.secondary" variant="body2">
                No showtimes yet.
              </Typography>
            ) : (
              <Stack spacing={1}>
                {data.showtimes.map((s) => (
                  <Stack key={s.id} alignItems="center" direction="row" spacing={1}>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography
                        sx={{
                          textDecoration: s.status === "CANCELED" ? "line-through" : "none",
                        }}
                        variant="body2"
                      >
                        {formatTheatreTime(s.startTime, true)}
                        {s.label ? ` · ${s.label}` : ""}
                      </Typography>
                      {s._count.attendance > 0 && (
                        <Typography color="text.secondary" variant="caption">
                          {`Logged by ${s._count.attendance}`}
                        </Typography>
                      )}
                    </Box>
                    <TextField
                      select
                      disabled={busy}
                      inputProps={{ "aria-label": "Status" }}
                      size="small"
                      sx={{ width: 120 }}
                      value={s.status}
                      onChange={(e) => send("PATCH", { id: s.id, status: e.target.value })}
                    >
                      {Object.entries(STATUS_LABELS).map(([value, text]) => (
                        <MenuItem key={value} value={value}>
                          {text}
                        </MenuItem>
                      ))}
                    </TextField>
                    <IconButton
                      aria-label="Remove showtime"
                      color="error"
                      disabled={busy}
                      size="small"
                      onClick={() => send("DELETE", { id: s.id })}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                ))}
              </Stack>
            )}
          </Stack>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Done</Button>
      </DialogActions>
    </Dialog>
  );
}

export default ShowtimesDialog;
