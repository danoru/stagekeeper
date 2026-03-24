import {
  Alert,
  Box,
  Button,
  Chip,
  Divider,
  Grid,
  IconButton,
  Paper,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import { musicals } from "@prisma/client";
import Head from "next/head";
import Link from "next/link";
import { useEffect, useState } from "react";

import AdminGuard from "../../src/components/admin/AdminGuard";

const EMPTY_FORM = {
  title: "",
  musicBy: "",
  lyricsBy: "",
  bookBy: "",
  premiere: "",
  duration: "",
  playbill: "",
};

export default function AdminMusicalsPage() {
  const [musicals, setMusicals] = useState<musicals[]>([]);
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
    fetch("/api/admin/musicals")
      .then((r) => r.json())
      .then(setMusicals);
  }, []);

  function startEdit(musical: musicals) {
    setEditId(musical.id);
    setForm({
      title: musical.title,
      musicBy: musical.musicBy || "",
      lyricsBy: musical.lyricsBy || "",
      bookBy: musical.bookBy || "",
      premiere: musical.premiere ? new Date(musical.premiere).toISOString().split("T")[0] : "",
      duration: musical.duration ? String(musical.duration) : "",
      playbill: musical.playbill || "",
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

    const res = await fetch("/api/admin/musicals", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    setSaving(false);

    if (res.ok) {
      showSnackbar(editId ? "Musical updated." : "Musical created.", "success");
      if (editId) {
        setMusicals((prev) => prev.map((m) => (m.id === editId ? data : m)));
      } else {
        setMusicals((prev) => [...prev, data].sort((a, b) => a.title.localeCompare(b.title)));
      }
      cancelEdit();
    } else {
      showSnackbar(data.error || "Something went wrong.", "error");
    }
  }

  const filtered = musicals.filter((m) => m.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <AdminGuard>
      <Head>
        <title>Musicals • Admin • StageKeeper</title>
      </Head>
      <Box sx={{ maxWidth: 1100, mx: "auto", mt: 4, px: 2 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
          <Typography variant="h5">
            <Link href="/admin" style={{ textDecoration: "none", color: "inherit" }}>
              Admin
            </Link>
            {" / Musicals"}
          </Typography>
          <Chip label={`${musicals.length} total`} size="small" />
        </Stack>

        <Grid container spacing={3}>
          {/* Form panel */}
          <Grid size={{ xs: 12, md: 5 }}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                {editId ? "Edit Musical" : "Add Musical"}
              </Typography>
              <form onSubmit={handleSubmit}>
                <Stack spacing={2}>
                  <TextField
                    required
                    fullWidth
                    label="Title"
                    size="small"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                  />
                  <TextField
                    fullWidth
                    label="Music by"
                    size="small"
                    value={form.musicBy}
                    onChange={(e) => setForm({ ...form, musicBy: e.target.value })}
                  />
                  <TextField
                    fullWidth
                    label="Lyrics by"
                    size="small"
                    value={form.lyricsBy}
                    onChange={(e) => setForm({ ...form, lyricsBy: e.target.value })}
                  />
                  <TextField
                    fullWidth
                    label="Book by"
                    size="small"
                    value={form.bookBy}
                    onChange={(e) => setForm({ ...form, bookBy: e.target.value })}
                  />
                  <Stack direction="row" spacing={1}>
                    <TextField
                      fullWidth
                      label="Broadway premiere"
                      size="small"
                      type="date"
                      InputLabelProps={{ shrink: true }}
                      value={form.premiere}
                      onChange={(e) => setForm({ ...form, premiere: e.target.value })}
                    />
                    <TextField
                      fullWidth
                      label="Duration (min)"
                      size="small"
                      type="number"
                      value={form.duration}
                      onChange={(e) => setForm({ ...form, duration: e.target.value })}
                    />
                  </Stack>
                  <TextField
                    fullWidth
                    label="Playbill image URL"
                    size="small"
                    value={form.playbill}
                    onChange={(e) => setForm({ ...form, playbill: e.target.value })}
                  />
                  <Stack direction="row" spacing={1}>
                    <Button type="submit" variant="contained" disabled={saving} fullWidth>
                      {saving ? "Saving…" : editId ? "Save Changes" : "Add Musical"}
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

          {/* List panel */}
          <Grid size={{ xs: 12, md: 7 }}>
            <Paper sx={{ p: 3 }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search musicals…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                sx={{ mb: 2 }}
              />
              <Stack divider={<Divider />} spacing={0}>
                {filtered.map((musical) => (
                  <Stack
                    key={musical.id}
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    sx={{ py: 1 }}
                  >
                    <Box>
                      <Typography variant="body2" fontWeight={500}>
                        {musical.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {[
                          musical.musicBy && `Music: ${musical.musicBy}`,
                          musical.premiere && new Date(musical.premiere).getFullYear(),
                        ]
                          .filter(Boolean)
                          .join(" · ")}
                      </Typography>
                    </Box>
                    <IconButton size="small" onClick={() => startEdit(musical)}>
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
                    No musicals found.
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
