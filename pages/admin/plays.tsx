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
import { plays } from "@prisma/client";
import Head from "next/head";
import Link from "next/link";
import { useEffect, useState } from "react";

import AdminGuard from "../../src/components/admin/AdminGuard";

const EMPTY_FORM = {
  title: "",
  writtenBy: "",
  premiere: "",
  duration: "",
  playbill: "",
};

export default function AdminPlaysPage() {
  const [plays, setPlays] = useState<plays[]>([]);
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
    fetch("/api/admin/plays")
      .then((r) => r.json())
      .then(setPlays);
  }, []);

  function startEdit(play: plays) {
    setEditId(play.id);
    setForm({
      title: play.title,
      writtenBy: play.writtenBy || "",
      premiere: play.premiere ? new Date(play.premiere).toISOString().split("T")[0] : "",
      duration: play.duration ? String(play.duration) : "",
      playbill: play.playbill || "",
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

    const res = await fetch("/api/admin/plays", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    setSaving(false);

    if (res.ok) {
      showSnackbar(editId ? "Play updated." : "Play created.", "success");
      if (editId) {
        setPlays((prev) => prev.map((p) => (p.id === editId ? data : p)));
      } else {
        setPlays((prev) => [...prev, data].sort((a, b) => a.title.localeCompare(b.title)));
      }
      cancelEdit();
    } else {
      showSnackbar(data.error || "Something went wrong.", "error");
    }
  }

  const filtered = plays.filter((p) => p.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <AdminGuard>
      <Head>
        <title>Plays • Admin • StageKeeper</title>
      </Head>
      <Box sx={{ maxWidth: 1100, mx: "auto", mt: 4, px: 2 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
          <Typography variant="h5">
            <Link href="/admin" style={{ textDecoration: "none", color: "inherit" }}>
              Admin
            </Link>
            {" / Plays"}
          </Typography>
          <Chip label={`${plays.length} total`} size="small" />
        </Stack>

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 5 }}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                {editId ? "Edit Play" : "Add Play"}
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
                    label="Written by"
                    size="small"
                    value={form.writtenBy}
                    onChange={(e) => setForm({ ...form, writtenBy: e.target.value })}
                  />
                  <Stack direction="row" spacing={1}>
                    <TextField
                      required
                      fullWidth
                      label="Premiere date"
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
                      {saving ? "Saving…" : editId ? "Save Changes" : "Add Play"}
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
                placeholder="Search plays…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                sx={{ mb: 2 }}
              />
              <Stack divider={<Divider />} spacing={0}>
                {filtered.map((play) => (
                  <Stack
                    key={play.id}
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    sx={{ py: 1 }}
                  >
                    <Box>
                      <Typography variant="body2" fontWeight={500}>
                        {play.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {[
                          play.writtenBy && `By ${play.writtenBy}`,
                          play.premiere && new Date(play.premiere).getFullYear(),
                        ]
                          .filter(Boolean)
                          .join(" · ")}
                      </Typography>
                    </Box>
                    <IconButton size="small" onClick={() => startEdit(play)}>
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
                    No plays found.
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
