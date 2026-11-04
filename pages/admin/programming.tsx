import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  MenuItem,
  Paper,
  Snackbar,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import ScheduleIcon from "@mui/icons-material/Schedule";
import { musicals, plays, programming, seasons, theatres } from "@prisma/client";
import Head from "next/head";
import Link from "next/link";
import { useEffect, useState } from "react";

import AdminGuard from "../../src/components/admin/AdminGuard";
import ShowtimesDialog from "../../src/components/admin/ShowtimesDialog";
import {
  DEFAULT_DAY_TIMES,
  hasDayTimes,
  parseTime,
  WEEK_ORDER,
  type DayTimes,
} from "../../src/utils/schedule";

type ProgramWithRelations = programming & {
  musicals: musicals | null;
  plays: plays | null;
  seasons: (seasons & { theatres: theatres }) | null;
};

const EMPTY_FORM = {
  type: "MUSICAL" as "MUSICAL" | "PLAY",
  musical: "",
  play: "",
  season: "",
  startDate: "",
  endDate: "",
};

const EMPTY_SCHEDULE: Record<string, string> = Object.fromEntries(WEEK_ORDER.map((d) => [d, ""]));

function displayTime(time: string) {
  const [hour, minute] = time.split(":").map(Number);
  const suffix = hour >= 12 ? "pm" : "am";
  const h = hour % 12 || 12;
  return minute ? `${h}:${String(minute).padStart(2, "0")}${suffix}` : `${h}${suffix}`;
}

function scheduleToText(dayTimes: unknown): Record<string, string> {
  if (!hasDayTimes(dayTimes)) return EMPTY_SCHEDULE;
  return Object.fromEntries(
    WEEK_ORDER.map((d) => [d, (dayTimes[d] ?? []).map(displayTime).join(", ")])
  );
}

/** Turns the day inputs into a weekly pattern, or names the first thing it can't read. */
function textToSchedule(text: Record<string, string>): DayTimes | string {
  const out: DayTimes = {};
  for (const day of WEEK_ORDER) {
    const pieces = text[day]
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    const times: string[] = [];
    for (const piece of pieces) {
      const time = parseTime(piece);
      if (!time) return `Couldn't read "${piece}" on ${day}. Try "2pm, 8pm".`;
      times.push(time);
    }
    if (times.length > 0) out[day] = times;
  }
  return out;
}

export default function AdminProgrammingPage() {
  const [programs, setPrograms] = useState<ProgramWithRelations[]>([]);
  const [musicals, setMusicals] = useState<musicals[]>([]);
  const [plays, setPlays] = useState<plays[]>([]);
  const [seasons, setSeasons] = useState<(seasons & { theatres: theatres })[]>([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [schedule, setSchedule] = useState(EMPTY_SCHEDULE);
  const [showtimesFor, setShowtimesFor] = useState<ProgramWithRelations | null>(null);
  const [editId, setEditId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({
    open: false,
    message: "",
    severity: "success",
  });

  useEffect(() => {
    fetch("/api/admin/programming")
      .then((r) => r.json())
      .then(setPrograms);
    fetch("/api/admin/musicals")
      .then((r) => r.json())
      .then(setMusicals);
    fetch("/api/admin/plays")
      .then((r) => r.json())
      .then(setPlays);
    fetch("/api/admin/seasons")
      .then((r) => r.json())
      .then(setSeasons);
  }, []);

  function startEdit(program: ProgramWithRelations) {
    setEditId(program.id);
    setForm({
      type: program.type as "MUSICAL" | "PLAY",
      musical: program.musical ? String(program.musical) : "",
      play: program.play ? String(program.play) : "",
      season: program.season ? String(program.season) : "",
      startDate: new Date(program.startDate).toISOString().split("T")[0],
      endDate: new Date(program.endDate).toISOString().split("T")[0],
    });
    setSchedule(scheduleToText(program.dayTimes));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cancelEdit() {
    setEditId(null);
    setForm(EMPTY_FORM);
    setSchedule(EMPTY_SCHEDULE);
  }

  function showSnackbar(message: string, severity: "success" | "error") {
    setSnackbar({ open: true, message, severity });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const dayTimes = textToSchedule(schedule);
    if (typeof dayTimes === "string") {
      showSnackbar(dayTimes, "error");
      return;
    }
    setSaving(true);
    const method = editId ? "PUT" : "POST";
    const body = editId ? { ...form, dayTimes, id: editId } : { ...form, dayTimes };

    const res = await fetch("/api/admin/programming", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    setSaving(false);

    if (res.ok) {
      showSnackbar(editId ? "Programming updated." : "Programming added.", "success");
      if (editId) {
        setPrograms((prev) => prev.map((p) => (p.id === editId ? data : p)));
      } else {
        setPrograms((prev) => [data, ...prev]);
      }
      cancelEdit();
    } else {
      showSnackbar(data.error || "Something went wrong.", "error");
    }
  }

  async function handleDelete() {
    if (!deleteId) return;
    const res = await fetch("/api/admin/programming", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: deleteId }),
    });
    if (res.ok) {
      setPrograms((prev) => prev.filter((p) => p.id !== deleteId));
      showSnackbar("Programming entry deleted.", "success");
    } else {
      showSnackbar("Failed to delete entry.", "error");
    }
    setDeleteId(null);
  }

  const showLabel = (p: ProgramWithRelations) =>
    p.type === "MUSICAL" ? p.musicals?.title : p.plays?.title;

  const filtered = programs.filter((p) => {
    const title = showLabel(p)?.toLowerCase() || "";
    const theatre = p.seasons?.theatres?.name.toLowerCase() || "";
    const q = search.toLowerCase();
    return title.includes(q) || theatre.includes(q);
  });

  return (
    <AdminGuard>
      <Head>
        <title>Programming • Admin • StageKeeper</title>
      </Head>
      <Box sx={{ maxWidth: 1200, mx: "auto", mt: 4, px: 2 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
          <Typography variant="h5">
            <Link href="/admin" style={{ textDecoration: "none", color: "inherit" }}>
              Admin
            </Link>
            {" / Programming"}
          </Typography>
          <Chip label={`${programs.length} total`} size="small" />
        </Stack>

        <Grid container spacing={3}>
          {/* Form */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                {editId ? "Edit Entry" : "Add Programming"}
              </Typography>
              <form onSubmit={handleSubmit}>
                <Stack spacing={2}>
                  <ToggleButtonGroup
                    exclusive
                    fullWidth
                    size="small"
                    value={form.type}
                    onChange={(_, val) =>
                      val && setForm({ ...form, type: val, musical: "", play: "" })
                    }
                  >
                    <ToggleButton value="MUSICAL">Musical</ToggleButton>
                    <ToggleButton value="PLAY">Play</ToggleButton>
                  </ToggleButtonGroup>

                  {form.type === "MUSICAL" ? (
                    <TextField
                      required
                      select
                      fullWidth
                      label="Musical"
                      size="small"
                      value={form.musical}
                      onChange={(e) => setForm({ ...form, musical: e.target.value })}
                    >
                      {musicals.map((m) => (
                        <MenuItem key={m.id} value={m.id}>
                          {m.title}
                        </MenuItem>
                      ))}
                    </TextField>
                  ) : (
                    <TextField
                      required
                      select
                      fullWidth
                      label="Play"
                      size="small"
                      value={form.play}
                      onChange={(e) => setForm({ ...form, play: e.target.value })}
                    >
                      {plays.map((p) => (
                        <MenuItem key={p.id} value={p.id}>
                          {p.title}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}

                  <TextField
                    required
                    select
                    fullWidth
                    label="Season"
                    size="small"
                    value={form.season}
                    onChange={(e) => setForm({ ...form, season: e.target.value })}
                  >
                    {seasons.map((s) => (
                      <MenuItem key={s.id} value={s.id}>
                        {s.theatres?.name} — {s.name}
                      </MenuItem>
                    ))}
                  </TextField>

                  <TextField
                    required
                    fullWidth
                    label="Start date"
                    size="small"
                    type="date"
                    InputLabelProps={{ shrink: true }}
                    value={form.startDate}
                    onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                  />
                  <TextField
                    required
                    fullWidth
                    label="End date"
                    size="small"
                    type="date"
                    InputLabelProps={{ shrink: true }}
                    value={form.endDate}
                    onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                  />

                  <Box>
                    <Stack
                      direction="row"
                      alignItems="center"
                      justifyContent="space-between"
                      sx={{ mb: 1 }}
                    >
                      <Typography variant="body2" fontWeight={500}>
                        Weekly schedule
                      </Typography>
                      <Button
                        size="small"
                        onClick={() => setSchedule(scheduleToText(DEFAULT_DAY_TIMES))}
                      >
                        Fill typical week
                      </Button>
                    </Stack>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ display: "block", mb: 1 }}
                    >
                      Times at the theatre, like &quot;2pm, 8pm&quot;. Leave every day blank if you
                      don&apos;t know yet; the site then shows a typical week labelled as estimated.
                    </Typography>
                    <Stack spacing={1}>
                      {WEEK_ORDER.map((day) => (
                        <TextField
                          key={day}
                          fullWidth
                          label={day}
                          size="small"
                          value={schedule[day]}
                          onChange={(e) => setSchedule({ ...schedule, [day]: e.target.value })}
                        />
                      ))}
                    </Stack>
                  </Box>

                  <Stack direction="row" spacing={1}>
                    <Button type="submit" variant="contained" disabled={saving} fullWidth>
                      {saving ? "Saving…" : editId ? "Save Changes" : "Add"}
                    </Button>
                    {editId && (
                      <Button variant="outlined" onClick={cancelEdit} fullWidth>
                        Cancel
                      </Button>
                    )}
                  </Stack>
                </Stack>
              </form>
            </Paper>
          </Grid>

          {/* List */}
          <Grid size={{ xs: 12, md: 8 }}>
            <Paper sx={{ p: 3 }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search by show or theatre…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                sx={{ mb: 2 }}
              />
              <Stack divider={<Divider />} spacing={0}>
                {filtered.map((program) => (
                  <Stack
                    key={program.id}
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    sx={{ py: 1 }}
                  >
                    <Box>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography variant="body2" fontWeight={500}>
                          {showLabel(program)}
                        </Typography>
                        <Chip
                          label={program.type}
                          size="small"
                          variant="outlined"
                          sx={{ fontSize: "0.65rem", height: 18 }}
                        />
                        {!hasDayTimes(program.dayTimes) && (
                          <Chip
                            label="Estimated times"
                            size="small"
                            color="warning"
                            variant="outlined"
                            sx={{ fontSize: "0.65rem", height: 18 }}
                          />
                        )}
                      </Stack>
                      <Typography variant="caption" color="text.secondary">
                        {program.seasons?.theatres?.name} · {program.seasons?.name}
                      </Typography>
                      <br />
                      <Typography variant="caption" color="text.secondary">
                        {new Date(program.startDate).toLocaleDateString(undefined, {
                          timeZone: "UTC",
                        })}{" "}
                        –{" "}
                        {new Date(program.endDate).toLocaleDateString(undefined, {
                          timeZone: "UTC",
                        })}
                      </Typography>
                    </Box>
                    <Stack direction="row">
                      <IconButton
                        aria-label="Showtimes"
                        size="small"
                        onClick={() => setShowtimesFor(program)}
                      >
                        <ScheduleIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" onClick={() => startEdit(program)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => setDeleteId(program.id)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                  </Stack>
                ))}
                {filtered.length === 0 && (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ py: 2, textAlign: "center" }}
                  >
                    No programming entries found.
                  </Typography>
                )}
              </Stack>
            </Paper>
          </Grid>
        </Grid>
      </Box>

      {/* Delete confirmation dialog */}
      {showtimesFor && (
        <ShowtimesDialog
          programmingId={showtimesFor.id}
          title={showLabel(showtimesFor) ?? ""}
          onClose={() => setShowtimesFor(null)}
        />
      )}

      <Dialog open={!!deleteId} onClose={() => setDeleteId(null)}>
        <DialogTitle>Delete programming entry?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This will remove this show from the season schedule. This cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteId(null)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={handleDelete}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </AdminGuard>
  );
}
