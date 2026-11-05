import EditIcon from "@mui/icons-material/Edit";
import {
  Alert,
  Box,
  Button,
  Chip,
  Divider,
  Grid,
  IconButton,
  MenuItem,
  Paper,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { seasons, theatres } from "@prisma/client";
import Head from "next/head";
import Link from "next/link";
import { useEffect, useState } from "react";

import AdminGuard from "../../src/components/admin/AdminGuard";

type SeasonWithTheatre = seasons & { theatres: theatres };

const EMPTY_FORM = {
  name: "",
  theatre: "",
  startDate: "",
  endDate: "",
};

export default function AdminSeasonsPage() {
  const [seasons, setSeasons] = useState<SeasonWithTheatre[]>([]);
  const [theatres, setTheatres] = useState<theatres[]>([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editId, setEditId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
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
    fetch("/api/admin/seasons")
      .then((r) => r.json())
      .then(setSeasons);
    fetch("/api/admin/theatres")
      .then((r) => r.json())
      .then(setTheatres);
  }, []);

  function startEdit(season: SeasonWithTheatre) {
    setEditId(season.id);
    setForm({
      name: season.name,
      theatre: String(season.theatre),
      startDate: new Date(season.startDate).toISOString().split("T")[0],
      endDate: new Date(season.endDate).toISOString().split("T")[0],
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

    const res = await fetch("/api/admin/seasons", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    setSaving(false);

    if (res.ok) {
      showSnackbar(editId ? "Season updated." : "Season created.", "success");
      if (editId) {
        setSeasons((prev) => prev.map((s) => (s.id === editId ? data : s)));
      } else {
        setSeasons((prev) => [data, ...prev]);
      }
      cancelEdit();
    } else {
      showSnackbar(data.error || "Something went wrong.", "error");
    }
  }

  const filtered = seasons.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.theatres?.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminGuard>
      <Head>
        <title>Seasons • Admin • StageKeeper</title>
      </Head>
      <Box sx={{ maxWidth: 1100, mx: "auto", mt: 4, px: 2 }}>
        <Stack alignItems="center" direction="row" justifyContent="space-between" mb={2}>
          <Typography variant="h5">
            <Link href="/admin" style={{ textDecoration: "none", color: "inherit" }}>
              Admin
            </Link>
            {" / Seasons"}
          </Typography>
          <Chip label={`${seasons.length} total`} size="small" />
        </Stack>

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 5 }}>
            <Paper sx={{ p: 3 }}>
              <Typography gutterBottom variant="h6">
                {editId ? "Edit Season" : "Add Season"}
              </Typography>
              <form onSubmit={handleSubmit}>
                <Stack spacing={2}>
                  <TextField
                    fullWidth
                    required
                    label="Season name"
                    placeholder="2024-2025 Season"
                    size="small"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                  <TextField
                    fullWidth
                    required
                    select
                    label="Theatre"
                    size="small"
                    value={form.theatre}
                    onChange={(e) => setForm({ ...form, theatre: e.target.value })}
                  >
                    {theatres.map((t) => (
                      <MenuItem key={t.id} value={t.id}>
                        {t.name}
                      </MenuItem>
                    ))}
                  </TextField>
                  <TextField
                    fullWidth
                    required
                    InputLabelProps={{ shrink: true }}
                    label="Start date"
                    size="small"
                    type="date"
                    value={form.startDate}
                    onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                  />
                  <TextField
                    fullWidth
                    required
                    InputLabelProps={{ shrink: true }}
                    label="End date"
                    size="small"
                    type="date"
                    value={form.endDate}
                    onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                  />
                  <Stack direction="row" spacing={1}>
                    <Button fullWidth disabled={saving} type="submit" variant="contained">
                      {saving ? "Saving…" : editId ? "Save Changes" : "Add Season"}
                    </Button>
                    {editId && (
                      <Button fullWidth variant="outlined" onClick={cancelEdit}>
                        Cancel
                      </Button>
                    )}
                  </Stack>
                </Stack>
              </form>
            </Paper>
          </Grid>

          <Grid size={{ xs: 12, md: 7 }}>
            <Paper sx={{ p: 3 }}>
              <TextField
                fullWidth
                placeholder="Search seasons…"
                size="small"
                sx={{ mb: 2 }}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <Stack divider={<Divider />} spacing={0}>
                {filtered.map((season) => (
                  <Stack
                    key={season.id}
                    alignItems="center"
                    direction="row"
                    justifyContent="space-between"
                    sx={{ py: 1 }}
                  >
                    <Box>
                      <Typography fontWeight={500} variant="body2">
                        {season.name}
                      </Typography>
                      <Typography color="text.secondary" variant="caption">
                        {season.theatres?.name} · {new Date(season.startDate).toLocaleDateString()}{" "}
                        – {new Date(season.endDate).toLocaleDateString()}
                      </Typography>
                    </Box>
                    <IconButton size="small" onClick={() => startEdit(season)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                ))}
                {filtered.length === 0 && (
                  <Typography
                    color="text.secondary"
                    sx={{ py: 2, textAlign: "center" }}
                    variant="body2"
                  >
                    No seasons found.
                  </Typography>
                )}
              </Stack>
            </Paper>
          </Grid>
        </Grid>
      </Box>

      <Snackbar
        autoHideDuration={4000}
        open={snackbar.open}
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
