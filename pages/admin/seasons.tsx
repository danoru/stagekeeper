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
import EditIcon from "@mui/icons-material/Edit";
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
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
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
              <Typography variant="h6" gutterBottom>
                {editId ? "Edit Season" : "Add Season"}
              </Typography>
              <form onSubmit={handleSubmit}>
                <Stack spacing={2}>
                  <TextField
                    required
                    fullWidth
                    label="Season name"
                    size="small"
                    placeholder="2024-2025 Season"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                  <TextField
                    required
                    select
                    fullWidth
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
                      {saving ? "Saving…" : editId ? "Save Changes" : "Add Season"}
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

          <Grid size={{ xs: 12, md: 7 }}>
            <Paper sx={{ p: 3 }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search seasons…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                sx={{ mb: 2 }}
              />
              <Stack divider={<Divider />} spacing={0}>
                {filtered.map((season) => (
                  <Stack
                    key={season.id}
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    sx={{ py: 1 }}
                  >
                    <Box>
                      <Typography variant="body2" fontWeight={500}>
                        {season.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
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
                    variant="body2"
                    color="text.secondary"
                    sx={{ py: 2, textAlign: "center" }}
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
