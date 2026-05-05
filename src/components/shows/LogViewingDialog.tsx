import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  Link,
  MenuItem,
  Rating,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import type { performances, theatres } from "@prisma/client";
import moment from "moment";
import { useState } from "react";

type PastPerformance = performances & { theatres: theatres };

interface Props {
  open: boolean;
  onClose: () => void;
  onLogged: () => void;
  showType: "MUSICAL" | "PLAY";
  showId: number;
  showTitle: string;
  pastPerformances: PastPerformance[];
  theatres: theatres[];
}

export default function LogViewingDialog({
  open,
  onClose,
  onLogged,
  showType,
  showId,
  showTitle,
  pastPerformances,
  theatres,
}: Props) {
  const hasPerfs = pastPerformances.length > 0;

  const [mode, setMode] = useState<"specific" | "vague">(hasPerfs ? "specific" : "vague");
  const [performanceId, setPerformanceId] = useState<number | "">(
    hasPerfs ? pastPerformances[0].id : ""
  );
  const [seenDate, setSeenDate] = useState<string>("");
  const [theatreId, setTheatreId] = useState<number | "">("");
  const [rating, setRating] = useState<number | null>(null);
  const [comment, setComment] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function reset() {
    setMode(hasPerfs ? "specific" : "vague");
    setPerformanceId(hasPerfs ? pastPerformances[0].id : "");
    setSeenDate("");
    setTheatreId("");
    setRating(null);
    setComment("");
    setError(null);
  }

  function handleClose() {
    if (submitting) return;
    onClose();
    setTimeout(reset, 200);
  }

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);

    const payload =
      mode === "specific" && performanceId
        ? {
            performanceId,
            rating,
            comment: comment.trim() || null,
          }
        : {
            type: showType,
            musicalId: showType === "MUSICAL" ? showId : undefined,
            playId: showType === "PLAY" ? showId : undefined,
            theatreId: theatreId || null,
            seenDate: seenDate || null,
            rating,
            comment: comment.trim() || null,
          };

    try {
      const res = await fetch("/api/shows/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to log viewing.");
      } else {
        onLogged();
        handleClose();
      }
    } catch {
      setError("Network error. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog fullWidth maxWidth="sm" open={open} onClose={handleClose}>
      <DialogTitle
        sx={{
          fontFamily: '"Cormorant Garamond", serif',
          fontSize: "1.4rem",
          color: "#E8DCC8",
        }}
      >
        Log a viewing of {showTitle}
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2.5} sx={{ mt: 1 }}>
          {mode === "specific" ? (
            <>
              <FormControl fullWidth size="small">
                <InputLabel id="performance-select-label">Performance</InputLabel>
                <Select
                  label="Performance"
                  labelId="performance-select-label"
                  value={performanceId}
                  onChange={(e) => setPerformanceId(Number(e.target.value))}
                >
                  {pastPerformances.map((p) => (
                    <MenuItem key={p.id} value={p.id}>
                      {moment(p.startTime).format("MMM D, YYYY")} — {p.theatres.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Link
                component="button"
                type="button"
                underline="hover"
                onClick={() => setMode("vague")}
                sx={{
                  fontFamily: '"DM Sans", sans-serif',
                  fontSize: "0.78rem",
                  color: "rgba(212,175,85,0.7)",
                  textAlign: "left",
                  alignSelf: "flex-start",
                }}
              >
                I don&apos;t remember the date or theatre
              </Link>
            </>
          ) : (
            <>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <TextField
                  fullWidth
                  label="Date (optional)"
                  size="small"
                  type="date"
                  value={seenDate}
                  InputLabelProps={{ shrink: true }}
                  onChange={(e) => setSeenDate(e.target.value)}
                />
                <FormControl fullWidth size="small">
                  <InputLabel id="theatre-select-label">Theatre (optional)</InputLabel>
                  <Select
                    label="Theatre (optional)"
                    labelId="theatre-select-label"
                    value={theatreId}
                    onChange={(e) => {
                      const v = e.target.value as number | "";
                      setTheatreId(v === "" ? "" : Number(v));
                    }}
                  >
                    <MenuItem value="">
                      <em>Don&apos;t remember</em>
                    </MenuItem>
                    {theatres.map((t) => (
                      <MenuItem key={t.id} value={t.id}>
                        {t.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Stack>
              {hasPerfs && (
                <Link
                  component="button"
                  type="button"
                  underline="hover"
                  onClick={() => setMode("specific")}
                  sx={{
                    fontFamily: '"DM Sans", sans-serif',
                    fontSize: "0.78rem",
                    color: "rgba(212,175,85,0.7)",
                    textAlign: "left",
                    alignSelf: "flex-start",
                  }}
                >
                  Pick a specific performance instead
                </Link>
              )}
            </>
          )}

          <Box>
            <Typography
              sx={{
                fontFamily: '"DM Sans", sans-serif',
                fontSize: "0.62rem",
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: "rgba(232,220,200,0.5)",
                mb: 0.75,
              }}
            >
              Rating
            </Typography>
            <Rating
              precision={0.5}
              value={rating}
              onChange={(_, v) => setRating(v)}
              sx={{
                "& .MuiRating-iconFilled": { color: "#D4AF55" },
                "& .MuiRating-iconEmpty": { color: "rgba(212,175,85,0.25)" },
              }}
            />
          </Box>

          <TextField
            fullWidth
            multiline
            label="Note (optional)"
            maxRows={4}
            minRows={2}
            placeholder="Memorable moments, cast standouts…"
            size="small"
            value={comment}
            inputProps={{ maxLength: 500 }}
            onChange={(e) => setComment(e.target.value)}
          />

          {error && (
            <Typography sx={{ color: "#E57373", fontSize: "0.8rem" }}>{error}</Typography>
          )}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button disabled={submitting} onClick={handleClose}>
          Cancel
        </Button>
        <Button
          disabled={submitting || (mode === "specific" && !performanceId)}
          variant="contained"
          onClick={handleSubmit}
          sx={{
            background: "#D4AF55",
            color: "#0D1520",
            "&:hover": { background: "#E8C76A" },
          }}
        >
          {submitting ? "Logging…" : "Log viewing"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
