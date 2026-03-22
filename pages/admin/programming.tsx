import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Divider from "@mui/material/Divider";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import Snackbar from "@mui/material/Snackbar";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Typography from "@mui/material/Typography";
import { musicals, plays, programming, seasons, theatres } from "@prisma/client";
import Head from "next/head";
import Link from "next/link";
import { useEffect, useState } from "react";

import AdminGuard from "../../src/components/admin/AdminGuard";

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

export default function AdminProgrammingPage() {
  const [programs, setPrograms] = useState<ProgramWithRelations[]>([]);
  const [musicals, setMusicals] = useState<musicals[]>([]);
  const [plays, setPlays] = useState<plays[]>([]);
  const [seasons, setSeasons] = useState<(seasons & { theatres: theatres })[]>([]);
  const [form, setForm] = useState(EMPTY_FORM);
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
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cancelEdit() {
    setEditId(null);
    setForm(EMPTY_FORM);
  }

  function showSnackbar(message: string, severity: "success" | "error") {
    setSnackbar({ open: true, message, severity });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const method = editId ? "PUT" : "POST";
    const body = editId ? { ...form, id: editId } : form;

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
                      </Stack>
                      <Typography variant="caption" color="text.secondary">
                        {program.seasons?.theatres?.name} · {program.seasons?.name}
                      </Typography>
                      <br />
                      <Typography variant="caption" color="text.secondary">
                        {new Date(program.startDate).toLocaleDateString()} –{" "}
                        {new Date(program.endDate).toLocaleDateString()}
                      </Typography>
                    </Box>
                    <Stack direction="row">
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
