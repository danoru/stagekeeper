import EditIcon from "@mui/icons-material/Edit";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import Snackbar from "@mui/material/Snackbar";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
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
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
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
              <Typography variant="h6" gutterBottom>
                {editId ? "Edit Theatre" : "Add Theatre"}
              </Typography>
              <form onSubmit={handleSubmit}>
                <Stack spacing={2}>
                  <TextField
                    required
                    fullWidth
                    label="Name"
                    size="small"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                  <TextField
                    required
                    fullWidth
                    label="City, State"
                    size="small"
                    placeholder="Los Angeles, CA"
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
                    label="Photo URL"
                    size="small"
                    value={form.image}
                    onChange={(e) => setForm({ ...form, image: e.target.value })}
                  />
                  <Stack direction="row" spacing={1}>
                    <Button type="submit" variant="contained" disabled={saving} fullWidth>
                      {saving ? "Saving…" : editId ? "Save Changes" : "Add Theatre"}
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
                placeholder="Search theatres…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                sx={{ mb: 2 }}
              />
              <Stack divider={<Divider />} spacing={0}>
                {filtered.map((theatre) => (
                  <Stack
                    key={theatre.id}
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    sx={{ py: 1 }}
                  >
                    <Box>
                      <Typography variant="body2" fontWeight={500}>
                        {theatre.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
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
                    variant="body2"
                    color="text.secondary"
                    sx={{ py: 2, textAlign: "center" }}
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
