import EditIcon from "@mui/icons-material/Edit";
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
import { theatres } from "@prisma/client";
import Head from "next/head";
import Link from "next/link";
import { useEffect, useState } from "react";

import AdminGuard from "../../src/components/admin/AdminGuard";

const EMPTY_FORM = {
  name: "",
  location: "",
  address: "",
  link: "",
  seasonUrl: "",
  image: "",
};

export default function AdminTheatresPage() {
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
    fetch("/api/admin/theatres")
      .then((r) => r.json())
      .then(setTheatres);
  }, []);

  function startEdit(theatre: theatres) {
    setEditId(theatre.id);
    setForm({
      name: theatre.name,
      location: theatre.location || "",
      address: theatre.address || "",
      link: theatre.link || "",
      seasonUrl: theatre.seasonUrl || "",
      image: theatre.image || "",
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

    const res = await fetch("/api/admin/theatres", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    setSaving(false);

    if (res.ok) {
      showSnackbar(editId ? "Theatre updated." : "Theatre created.", "success");
      if (editId) {
        setTheatres((prev) => prev.map((t) => (t.id === editId ? data : t)));
      } else {
        setTheatres((prev) => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)));
      }
      cancelEdit();
    } else {
      showSnackbar(data.error || "Something went wrong.", "error");
    }
  }

  const filtered = theatres.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.location.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminGuard>
      <Head>
        <title>Theatres • Admin • StageKeeper</title>
      </Head>
      <Box sx={{ maxWidth: 1100, mx: "auto", mt: 4, px: 2 }}>
        <Stack alignItems="center" direction="row" justifyContent="space-between" mb={2}>
          <Typography variant="h5">
            <Link href="/admin" style={{ textDecoration: "none", color: "inherit" }}>
              Admin
            </Link>
            {" / Theatres"}
          </Typography>
          <Chip label={`${theatres.length} total`} size="small" />
        </Stack>

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 5 }}>
            <Paper sx={{ p: 3 }}>
              <Typography gutterBottom variant="h6">
                {editId ? "Edit Theatre" : "Add Theatre"}
              </Typography>
              <form onSubmit={handleSubmit}>
                <Stack spacing={2}>
                  <TextField
                    fullWidth
                    required
                    label="Name"
                    size="small"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                  <TextField
                    fullWidth
                    required
                    label="City, State"
                    placeholder="Los Angeles, CA"
                    size="small"
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                  />
                  <TextField
                    fullWidth
                    label="Street address"
                    size="small"
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                  />
                  <TextField
                    fullWidth
                    label="Website URL"
                    size="small"
                    value={form.link}
                    onChange={(e) => setForm({ ...form, link: e.target.value })}
                  />
                  <TextField
                    fullWidth
                    helperText="Page the season importer reads; defaults to the website URL."
                    label="Season page URL"
                    size="small"
                    value={form.seasonUrl}
                    onChange={(e) => setForm({ ...form, seasonUrl: e.target.value })}
                  />
                  <TextField
                    fullWidth
                    label="Photo URL"
                    size="small"
                    value={form.image}
                    onChange={(e) => setForm({ ...form, image: e.target.value })}
                  />
                  <Stack direction="row" spacing={1}>
                    <Button fullWidth disabled={saving} type="submit" variant="contained">
                      {saving ? "Saving…" : editId ? "Save Changes" : "Add Theatre"}
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
                placeholder="Search theatres…"
                size="small"
                sx={{ mb: 2 }}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <Stack divider={<Divider />} spacing={0}>
                {filtered.map((theatre) => (
                  <Stack
                    key={theatre.id}
                    alignItems="center"
                    direction="row"
                    justifyContent="space-between"
                    sx={{ py: 1 }}
                  >
                    <Box>
                      <Typography fontWeight={500} variant="body2">
                        {theatre.name}
                      </Typography>
                      <Typography color="text.secondary" variant="caption">
                        {theatre.location}
                      </Typography>
                    </Box>
                    <IconButton size="small" onClick={() => startEdit(theatre)}>
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
                    No theatres found.
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
