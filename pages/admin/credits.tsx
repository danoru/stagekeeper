import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import type { CreditCategory } from "@prisma/client";
import moment from "moment";
import Head from "next/head";
import { useCallback, useEffect, useState } from "react";

import AdminGuard from "../../src/components/admin/AdminGuard";
import { CATEGORY_LABELS, describePart } from "../../src/components/people/creditText";
import type { PendingCreditGroup } from "../../src/data/people";

type PendingCredit = PendingCreditGroup["credits"][number];

function productionLabel(group: PendingCreditGroup) {
  const p = group.production;
  const show = p.musicals?.title ?? p.plays?.title ?? "Unknown show";
  const theatre = p.seasons?.theatres.name ?? "Theatre TBD";
  return `${show} · ${theatre} · ${moment.utc(p.startDate).format("MMM D")} – ${moment
    .utc(p.endDate)
    .format("MMM D, YYYY")}`;
}

function EditDialog({
  credit,
  onClose,
  onSaved,
}: {
  credit: PendingCredit;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState(credit.people.name);
  const [category, setCategory] = useState<CreditCategory>(credit.category);
  const [part, setPart] = useState(
    (credit.category === "CAST" ? credit.character : credit.role) ?? ""
  );
  const [error, setError] = useState<string | null>(null);

  async function save() {
    setError(null);
    const res = await fetch("/api/admin/credits", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: credit.id,
        action: "edit",
        name: name.trim() !== credit.people.name ? name : undefined,
        category,
        character: category === "CAST" ? part : null,
        role: category === "CAST" ? null : part,
      }),
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(body.error ?? "Failed to save.");
      return;
    }
    onSaved();
  }

  return (
    <Dialog fullWidth open maxWidth="xs" onClose={onClose}>
      <DialogTitle>Edit credit</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          <TextField
            helperText={
              credit.people.status === "APPROVED"
                ? "This person already has approved credits; a new name moves this credit to a different person."
                : "Renames this new person."
            }
            label="Name"
            size="small"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <TextField
            select
            label="Category"
            size="small"
            value={category}
            onChange={(e) => setCategory(e.target.value as CreditCategory)}
          >
            {(Object.keys(CATEGORY_LABELS) as CreditCategory[]).map((c) => (
              <MenuItem key={c} value={c}>
                {CATEGORY_LABELS[c]}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label={category === "CAST" ? "Character" : "Role"}
            size="small"
            value={part}
            onChange={(e) => setPart(e.target.value)}
          />
          {error && <Alert severity="error">{error}</Alert>}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={save}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default function AdminCreditsPage() {
  const [groups, setGroups] = useState<PendingCreditGroup[] | null>(null);
  const [editing, setEditing] = useState<PendingCredit | null>(null);
  const [busy, setBusy] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    message: string;
    severity: "success" | "error";
  } | null>(null);

  const load = useCallback(() => {
    fetch("/api/admin/credits")
      .then((r) => r.json())
      .then(setGroups)
      .catch(() => setSnackbar({ message: "Failed to load.", severity: "error" }));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function act(method: "PATCH" | "DELETE", ids: number[]) {
    setBusy(true);
    try {
      const res = await fetch("/api/admin/credits", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(method === "PATCH" ? { ids, action: "approve" } : { ids }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error ?? "Failed.");
      setSnackbar({ message: body.message ?? "Done.", severity: "success" });
      load();
    } catch (e) {
      setSnackbar({ message: (e as Error).message, severity: "error" });
    } finally {
      setBusy(false);
    }
  }

  return (
    <AdminGuard>
      <Head>
        <title>Cast &amp; Crew • Admin • StageKeeper</title>
      </Head>
      <Box sx={{ maxWidth: 900, mx: "auto", mt: 4, px: 2, pb: 6 }}>
        <Typography gutterBottom variant="h4">
          Cast &amp; Crew Suggestions
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }} variant="body2">
          Credits suggested by members who saw the show. Approving a credit also confirms its
          person. Names that matched an existing person are linked to them; &ldquo;New person&rdquo;
          means nobody by that name existed yet.
        </Typography>

        {groups?.length === 0 && <Alert severity="success">Nothing waiting for review.</Alert>}

        <Stack spacing={3}>
          {groups?.map((group) => {
            const ids = group.credits.map((c) => c.id);
            return (
              <Box
                key={group.production.id}
                sx={{ p: 2, border: "1px solid", borderColor: "divider", borderRadius: 1 }}
              >
                <Stack
                  alignItems={{ sm: "center" }}
                  direction={{ xs: "column", sm: "row" }}
                  justifyContent="space-between"
                  spacing={1}
                  sx={{ mb: 1.5 }}
                >
                  <Typography sx={{ fontWeight: 600 }}>{productionLabel(group)}</Typography>
                  <Stack direction="row" spacing={1}>
                    <Button
                      disabled={busy}
                      size="small"
                      variant="contained"
                      onClick={() => act("PATCH", ids)}
                    >
                      Approve all
                    </Button>
                    <Button
                      color="error"
                      disabled={busy}
                      size="small"
                      onClick={() => act("DELETE", ids)}
                    >
                      Reject all
                    </Button>
                  </Stack>
                </Stack>
                <Stack spacing={1}>
                  {group.credits.map((c) => (
                    <Stack
                      key={c.id}
                      alignItems={{ sm: "center" }}
                      direction={{ xs: "column", sm: "row" }}
                      spacing={1}
                      sx={{ py: 0.5, borderTop: "1px solid", borderColor: "divider" }}
                    >
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography component="span">{c.people.name}</Typography>
                        <Typography color="text.secondary" component="span">
                          {` ${describePart(c)} · ${CATEGORY_LABELS[c.category]}`}
                        </Typography>
                        <Typography color="text.secondary" sx={{ fontSize: "0.75rem" }}>
                          {`Suggested by ${c.suggester?.username ?? "a deleted user"}`}
                        </Typography>
                      </Box>
                      {c.people.status === "PENDING" ? (
                        <Chip label="New person" size="small" />
                      ) : (
                        <Chip
                          clickable
                          color="success"
                          component="a"
                          href={`/people/${c.people.slug}`}
                          label="Existing person"
                          size="small"
                          target="_blank"
                          variant="outlined"
                        />
                      )}
                      <Stack direction="row" spacing={0.5}>
                        <Button disabled={busy} size="small" onClick={() => act("PATCH", [c.id])}>
                          Approve
                        </Button>
                        <Button disabled={busy} size="small" onClick={() => setEditing(c)}>
                          Edit
                        </Button>
                        <Button
                          color="error"
                          disabled={busy}
                          size="small"
                          onClick={() => act("DELETE", [c.id])}
                        >
                          Reject
                        </Button>
                      </Stack>
                    </Stack>
                  ))}
                </Stack>
              </Box>
            );
          })}
        </Stack>
      </Box>

      {editing && (
        <EditDialog
          credit={editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            setSnackbar({ message: "Saved.", severity: "success" });
            load();
          }}
        />
      )}
      <Snackbar autoHideDuration={4000} open={!!snackbar} onClose={() => setSnackbar(null)}>
        {snackbar ? <Alert severity={snackbar.severity}>{snackbar.message}</Alert> : undefined}
      </Snackbar>
    </AdminGuard>
  );
}
