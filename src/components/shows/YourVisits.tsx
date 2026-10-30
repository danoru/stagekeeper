import DeleteOutline from "@mui/icons-material/DeleteOutline";
import EditOutlined from "@mui/icons-material/EditOutlined";
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Rating,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import moment from "moment";
import { useState } from "react";

import { formatRating, mean } from "../../utils/ratings";
import { theatreToday } from "../../utils/schedule";

export interface Visit {
  id: number;
  seenDate: string | null;
  going: boolean;
  rating: string | number | null;
  comment: string | null;
  theatres: { id: number; name: string } | null;
  performances: { startTime: string; theatres: { id: number; name: string } | null } | null;
}

interface Props {
  visits: Visit[];
  /** Called after an edit or delete so the page can refetch. */
  onChanged: () => void;
}

const eyebrowSx = {
  fontFamily: '"DM Sans", sans-serif',
  fontSize: "0.62rem",
  letterSpacing: "0.22em",
  textTransform: "uppercase",
  color: "#D4AF55",
  whiteSpace: "nowrap",
} as const;

const starsSx = {
  "& .MuiRating-iconFilled": { color: "#D4AF55" },
  "& .MuiRating-iconEmpty": { color: "rgba(212,175,85,0.2)" },
};

function visitDate(v: Visit): string | null {
  return v.seenDate ?? v.performances?.startTime ?? null;
}

/** Visits that have happened; a "going" date counts once it's passed. */
export function pastVisits(visits: Visit[]): Visit[] {
  const today = theatreToday();
  return visits.filter((v) => {
    const date = visitDate(v);
    return !(v.going && date && new Date(date) >= today);
  });
}

function visitRating(v: Visit): number | null {
  return v.rating == null ? null : Number(v.rating);
}

function YourVisits({ visits, onChanged }: Props) {
  const seen = pastVisits(visits).sort((a, b) =>
    (visitDate(b) ?? "").localeCompare(visitDate(a) ?? "")
  );

  const [editing, setEditing] = useState<Visit | null>(null);
  const [deleting, setDeleting] = useState<Visit | null>(null);

  if (seen.length === 0) return null;

  const ratings = seen.map(visitRating).filter((r): r is number => r != null);
  const average = mean(ratings);

  return (
    <Box sx={{ mt: 4, px: { xs: 2, md: 4 } }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
        <Typography component="h2" sx={eyebrowSx}>
          Your Visits
        </Typography>
        <Box sx={{ flex: 1, height: "1px", background: "rgba(212,175,85,0.2)" }} />
        {average != null && (
          <Stack alignItems="center" direction="row" spacing={1}>
            <Rating readOnly precision={0.25} size="small" sx={starsSx} value={average} />
            <Typography sx={{ fontSize: "0.8rem", color: "rgba(232,220,200,0.75)" }}>
              {`Your rating ${formatRating(average)}`}
              {ratings.length > 1 && ` · avg of ${ratings.length} visits`}
            </Typography>
          </Stack>
        )}
      </Box>

      <Stack spacing={1}>
        {seen.map((visit) => {
          const date = visitDate(visit);
          const theatre = visit.theatres?.name ?? visit.performances?.theatres?.name ?? null;
          const rating = visitRating(visit);
          return (
            <Box
              key={visit.id}
              sx={{
                display: "flex",
                alignItems: { xs: "flex-start", sm: "center" },
                flexDirection: { xs: "column", sm: "row" },
                gap: { xs: 0.5, sm: 2 },
                px: 2,
                py: 1.25,
                border: "1px solid rgba(212,175,85,0.1)",
                borderRadius: 1,
                background: "rgba(212,175,85,0.02)",
              }}
            >
              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Typography sx={{ fontSize: "0.9rem", color: "rgba(232,220,200,0.9)" }}>
                  {date ? moment.utc(date).format("MMM D, YYYY") : "Date not logged"}
                  {theatre && (
                    <Box component="span" sx={{ color: "rgba(232,220,200,0.5)" }}>
                      {` · ${theatre}`}
                    </Box>
                  )}
                </Typography>
                {visit.comment && (
                  <Typography
                    sx={{
                      fontFamily: '"Cormorant Garamond", serif',
                      fontStyle: "italic",
                      fontSize: "0.95rem",
                      color: "rgba(232,220,200,0.6)",
                      overflowWrap: "anywhere",
                    }}
                  >
                    {visit.comment}
                  </Typography>
                )}
              </Box>
              <Stack alignItems="center" direction="row" spacing={0.5}>
                {rating != null ? (
                  <Rating readOnly precision={0.5} size="small" sx={starsSx} value={rating} />
                ) : (
                  <Typography sx={{ fontSize: "0.75rem", color: "rgba(232,220,200,0.35)" }}>
                    Not rated
                  </Typography>
                )}
                <IconButton
                  aria-label="Edit this visit"
                  size="small"
                  onClick={() => setEditing(visit)}
                >
                  <EditOutlined fontSize="small" />
                </IconButton>
                <IconButton
                  aria-label="Delete this visit"
                  size="small"
                  onClick={() => setDeleting(visit)}
                >
                  <DeleteOutline fontSize="small" />
                </IconButton>
              </Stack>
            </Box>
          );
        })}
      </Stack>

      {editing && (
        <EditVisitDialog
          visit={editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            onChanged();
          }}
        />
      )}
      {deleting && (
        <DeleteVisitDialog
          visit={deleting}
          onClose={() => setDeleting(null)}
          onDeleted={() => {
            setDeleting(null);
            onChanged();
          }}
        />
      )}
    </Box>
  );
}

function EditVisitDialog({
  visit,
  onClose,
  onSaved,
}: {
  visit: Visit;
  onClose: () => void;
  onSaved: () => void;
}) {
  const initialDate = visitDate(visit);
  const [date, setDate] = useState(initialDate ? moment.utc(initialDate).format("YYYY-MM-DD") : "");
  const [rating, setRating] = useState<number | null>(visitRating(visit));
  const [comment, setComment] = useState(visit.comment ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/shows/attendance", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attendanceId: visit.id, seenDate: date || null, rating, comment }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error ?? "Couldn't save that visit.");
      onSaved();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog fullWidth open maxWidth="xs" onClose={onClose}>
      <DialogTitle>Edit visit</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          <TextField
            InputLabelProps={{ shrink: true }}
            inputProps={{ max: moment().format("YYYY-MM-DD") }}
            label="Date"
            size="small"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
          <Box>
            <Typography
              component="legend"
              id="edit-visit-rating"
              sx={{ fontSize: "0.8rem", mb: 0.5 }}
            >
              Rating
            </Typography>
            <Rating
              aria-labelledby="edit-visit-rating"
              precision={0.5}
              sx={starsSx}
              value={rating}
              onChange={(_, value) => setRating(value)}
            />
          </Box>
          <TextField
            multiline
            inputProps={{ maxLength: 500 }}
            label="Note"
            minRows={2}
            size="small"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
          {error && <Alert severity="error">{error}</Alert>}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button disabled={saving} variant="contained" onClick={save}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function DeleteVisitDialog({
  visit,
  onClose,
  onDeleted,
}: {
  visit: Visit;
  onClose: () => void;
  onDeleted: () => void;
}) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const date = visitDate(visit);

  async function remove() {
    setDeleting(true);
    setError(null);
    try {
      const res = await fetch("/api/shows/attendance", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attendanceId: visit.id }),
      });
      if (!res.ok) throw new Error("Couldn't delete that visit.");
      onDeleted();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <Dialog fullWidth open maxWidth="xs" onClose={onClose}>
      <DialogTitle>Delete this visit?</DialogTitle>
      <DialogContent>
        <Typography>
          {date
            ? `Your ${moment.utc(date).format("MMM D, YYYY")} visit and its rating and note will be removed.`
            : "This visit and its rating and note will be removed."}
        </Typography>
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button color="error" disabled={deleting} variant="contained" onClick={remove}>
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default YourVisits;
