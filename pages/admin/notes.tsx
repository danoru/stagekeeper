import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import moment from "moment";
import Head from "next/head";
import { useCallback, useEffect, useState } from "react";

import AdminGuard from "../../src/components/admin/AdminGuard";

interface PendingNote {
  id: number;
  category: string;
  text: string;
  createdAt: string;
  theatres: { name: string };
  users: { username: string } | null;
}

export default function AdminNotesPage() {
  const [notes, setNotes] = useState<PendingNote[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/notes");
    const data = await res.json();
    if (!res.ok) return setError(data.error ?? "Couldn't load tips.");
    setNotes(data.notes);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function act(id: number, approve: boolean) {
    const res = await fetch("/api/admin/notes", {
      method: approve ? "PATCH" : "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(approve ? { id, action: "approve" } : { id }),
    });
    if (!res.ok) return setError("Couldn't update that tip.");
    setNotes((ns) => (ns ?? []).filter((n) => n.id !== id));
  }

  return (
    <AdminGuard>
      <Head>
        <title>Theatre tips • Admin • StageKeeper</title>
      </Head>
      <Box sx={{ maxWidth: 900, mx: "auto", p: { xs: 2, md: 4 } }}>
        <Typography gutterBottom variant="h4">
          Theatre tips
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }} variant="body2">
          &quot;Know before you go&quot; tips from members with a visit to the theatre. They appear
          on the theatre page once approved.
        </Typography>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        {notes === null ? (
          <CircularProgress size={24} />
        ) : notes.length === 0 ? (
          <Typography color="text.secondary">Nothing waiting.</Typography>
        ) : (
          <Stack spacing={2}>
            {notes.map((n) => (
              <Paper key={n.id} sx={{ p: 2 }}>
                <Stack alignItems="center" direction="row" spacing={1} sx={{ mb: 1 }}>
                  <Chip label={n.category} size="small" />
                  <Typography fontWeight={600}>{n.theatres.name}</Typography>
                  <Typography color="text.secondary" variant="body2">
                    {n.users?.username ?? "deleted account"} ·{" "}
                    {moment(n.createdAt).format("MMM D, YYYY")}
                  </Typography>
                </Stack>
                <Typography sx={{ mb: 1.5 }}>{n.text}</Typography>
                <Stack direction="row" spacing={1}>
                  <Button size="small" variant="contained" onClick={() => act(n.id, true)}>
                    Approve
                  </Button>
                  <Button size="small" onClick={() => act(n.id, false)}>
                    Reject
                  </Button>
                </Stack>
              </Paper>
            ))}
          </Stack>
        )}
      </Box>
    </AdminGuard>
  );
}
