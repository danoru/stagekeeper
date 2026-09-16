import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import Head from "next/head";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import AdminGuard from "../../src/components/admin/AdminGuard";

type Kind = "MUSICAL" | "PLAY" | "THEATRE";

interface PendingItem {
  id: number;
  title?: string;
  name?: string;
  location?: string;
  premiere?: string | null;
  creator: { id: number; username: string } | null;
  _count: { attendance: number; watchlist?: number; likedShows?: number };
}

interface PendingData {
  musicals: PendingItem[];
  plays: PendingItem[];
  theatres: PendingItem[];
}

interface MergeTarget {
  id: number;
  label: string;
}

function label(item: PendingItem) {
  return item.title ?? item.name ?? `#${item.id}`;
}

function refCount(item: PendingItem) {
  return item._count.attendance + (item._count.watchlist ?? 0) + (item._count.likedShows ?? 0);
}

export default function PendingContentPage() {
  const [data, setData] = useState<PendingData | null>(null);
  const [busy, setBusy] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    message: string;
    severity: "success" | "error";
  } | null>(null);
  const [merge, setMerge] = useState<{ kind: Kind; item: PendingItem } | null>(null);
  const [mergeQuery, setMergeQuery] = useState("");
  const [mergeOptions, setMergeOptions] = useState<MergeTarget[]>([]);
  const [mergeTarget, setMergeTarget] = useState<MergeTarget | null>(null);

  const load = useCallback(() => {
    fetch("/api/admin/pending")
      .then((r) => r.json())
      .then(setData)
      .catch(() => setSnackbar({ message: "Failed to load.", severity: "error" }));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!merge || mergeQuery.trim().length < 2) {
      setMergeOptions([]);
      return;
    }
    const kindParam = merge.kind === "THEATRE" ? "theatres" : "shows";
    const t = setTimeout(() => {
      fetch(`/api/catalog/search?kind=${kindParam}&q=${encodeURIComponent(mergeQuery.trim())}`)
        .then((r) => r.json())
        .then((res) => {
          const results = (res.results ?? []) as any[];
          setMergeOptions(
            results
              .filter((r) => (merge.kind === "THEATRE" ? true : r.type === merge.kind))
              .filter((r) => r.id !== merge.item.id)
              .map((r) => ({
                id: r.id,
                label: `${r.title ?? r.name}${r.location ? ` — ${r.location}` : ""}${
                  r.status === "PENDING" ? " (pending)" : ""
                }`,
              }))
          );
        });
    }, 250);
    return () => clearTimeout(t);
  }, [merge, mergeQuery]);

  async function act(kind: Kind, id: number, body: Record<string, unknown>, method: string) {
    setBusy(true);
    try {
      const res = await fetch("/api/admin/pending", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind, id, ...body }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setSnackbar({ message: json.error ?? "Failed.", severity: "error" });
        return false;
      }
      setSnackbar({ message: json.message ?? "Done.", severity: "success" });
      load();
      return true;
    } finally {
      setBusy(false);
    }
  }

  function Section({ kind, items, title }: { kind: Kind; items: PendingItem[]; title: string }) {
    const editHref =
      kind === "MUSICAL" ? "/admin/musicals" : kind === "PLAY" ? "/admin/plays" : "/admin/theatres";
    return (
      <Box sx={{ mb: 4 }}>
        <Typography sx={{ mb: 1.5 }} variant="h6">
          {title} <Chip label={items.length} size="small" sx={{ ml: 1 }} />
        </Typography>
        {items.length === 0 ? (
          <Typography color="text.secondary" variant="body2">
            Nothing waiting.
          </Typography>
        ) : (
          <Stack spacing={1}>
            {items.map((item) => (
              <Stack
                key={item.id}
                alignItems={{ xs: "flex-start", sm: "center" }}
                direction={{ xs: "column", sm: "row" }}
                spacing={1.5}
                sx={{
                  border: "1px solid rgba(212,175,85,0.12)",
                  borderRadius: 1,
                  px: 2,
                  py: 1.25,
                }}
              >
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography sx={{ fontWeight: 500 }}>{label(item)}</Typography>
                  <Typography color="text.secondary" variant="caption">
                    {item.location ? `${item.location} · ` : ""}
                    {item.premiere ? `${new Date(item.premiere).getUTCFullYear()} · ` : ""}
                    added by {item.creator?.username ?? "unknown"} · {refCount(item)} reference
                    {refCount(item) === 1 ? "" : "s"}
                  </Typography>
                </Box>
                <Stack direction="row" spacing={1}>
                  <Button
                    disabled={busy}
                    size="small"
                    variant="contained"
                    onClick={() => act(kind, item.id, { action: "approve" }, "PATCH")}
                  >
                    Approve
                  </Button>
                  <Button
                    disabled={busy}
                    size="small"
                    variant="outlined"
                    onClick={() => {
                      setMerge({ kind, item });
                      setMergeQuery("");
                      setMergeTarget(null);
                    }}
                  >
                    Merge into…
                  </Button>
                  <Button component={Link} href={editHref} size="small" variant="text">
                    Edit
                  </Button>
                  <Button
                    color="error"
                    disabled={busy || refCount(item) > 0}
                    size="small"
                    variant="text"
                    onClick={() => act(kind, item.id, {}, "DELETE")}
                  >
                    Delete
                  </Button>
                </Stack>
              </Stack>
            ))}
          </Stack>
        )}
      </Box>
    );
  }

  return (
    <AdminGuard>
      <Head>
        <title>Pending Submissions • StageKeeper</title>
      </Head>
      <Box sx={{ maxWidth: 900, mx: "auto", mt: 4, px: 2, pb: 6 }}>
        <Typography gutterBottom variant="h4">
          Pending Submissions
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 4 }} variant="body2">
          Shows and theatres members added while logging. Approve to keep as-is, merge if it
          duplicates something already in the catalog, or edit to fill in the details.
        </Typography>

        {!data ? (
          <CircularProgress />
        ) : (
          <>
            <Section items={data.musicals} kind="MUSICAL" title="Musicals" />
            <Section items={data.plays} kind="PLAY" title="Plays" />
            <Section items={data.theatres} kind="THEATRE" title="Theatres" />
          </>
        )}
      </Box>

      <Dialog fullWidth maxWidth="xs" open={merge !== null} onClose={() => setMerge(null)}>
        <DialogTitle>Merge &ldquo;{merge ? label(merge.item) : ""}&rdquo; into…</DialogTitle>
        <DialogContent>
          <Typography color="text.secondary" sx={{ mb: 2 }} variant="body2">
            Every log, watchlist entry and like pointing at the duplicate will be moved to the one
            you pick, then the duplicate is deleted.
          </Typography>
          <Autocomplete
            filterOptions={(x) => x}
            getOptionLabel={(o) => o.label}
            inputValue={mergeQuery}
            isOptionEqualToValue={(a, b) => a.id === b.id}
            options={mergeOptions}
            renderInput={(params) => <TextField {...params} autoFocus label="Search" />}
            value={mergeTarget}
            onChange={(_, v) => setMergeTarget(v)}
            onInputChange={(_, v) => setMergeQuery(v)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMerge(null)}>Cancel</Button>
          <Button
            disabled={busy || !mergeTarget}
            variant="contained"
            onClick={async () => {
              if (!merge || !mergeTarget) return;
              const ok = await act(
                merge.kind,
                merge.item.id,
                { action: "merge", intoId: mergeTarget.id },
                "PATCH"
              );
              if (ok) setMerge(null);
            }}
          >
            Merge
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar autoHideDuration={5000} open={snackbar !== null} onClose={() => setSnackbar(null)}>
        <Alert severity={snackbar?.severity ?? "success"} onClose={() => setSnackbar(null)}>
          {snackbar?.message}
        </Alert>
      </Snackbar>
    </AdminGuard>
  );
}
