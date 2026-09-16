import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import ContentPasteIcon from "@mui/icons-material/ContentPaste";
import DownloadIcon from "@mui/icons-material/Download";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
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
  DialogContentText,
  DialogTitle,
  Divider,
  IconButton,
  LinearProgress,
  Link as MuiLink,
  MenuItem,
  Paper,
  Snackbar,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import Head from "next/head";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

import AdminGuard from "../../src/components/admin/AdminGuard";

type PerformanceType = "MUSICAL" | "PLAY";

interface TheatreRow {
  id: number;
  name: string;
  link: string | null;
  seasonUrl: string | null;
  lastRun: { createdAt: string; status: string; itemCount: number; error: string | null } | null;
  latestSeason: {
    id: number;
    name: string;
    startDate: string;
    endDate: string;
    showCount: number;
  } | null;
  openCount: number;
}

interface ShowRef {
  id: number;
  title: string;
}

interface Candidate {
  id: number;
  theatre: number;
  sourceUrl: string;
  rawTitle: string;
  startDate: string | null;
  endDate: string | null;
  snippet: string | null;
  matchType: PerformanceType | null;
  matchMusical: number | null;
  matchPlay: number | null;
  existingProgramming: number | null;
  state: "NEW" | "DUPLICATE" | "APPROVED" | "SKIPPED";
  musicals: ShowRef | null;
  plays: ShowRef | null;
}

interface Season {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
}

interface ShowOption {
  id: number;
  type: PerformanceType;
  title: string;
}

const NEW_SEASON = "new";

function toDateInput(value: string | null | undefined) {
  return value ? new Date(value).toISOString().slice(0, 10) : "";
}

function fmtDate(value: string | null | undefined) {
  if (!value) return "?";
  return new Date(value).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

/** "2026–27 Season" / "2026 Season" from a run's dates. */
function defaultSeasonName(start: string, end: string) {
  const a = new Date(start).getUTCFullYear();
  const b = new Date(end).getUTCFullYear();
  return a === b ? `${a} Season` : `${a}–${String(b).slice(2)} Season`;
}

export default function AdminImportPage() {
  const [theatres, setTheatres] = useState<TheatreRow[]>([]);
  const [loadingTheatres, setLoadingTheatres] = useState(true);
  const [selected, setSelected] = useState<TheatreRow | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [running, setRunning] = useState<number | null>(null);
  const [runAll, setRunAll] = useState<{ done: number; total: number } | null>(null);
  const [editingUrl, setEditingUrl] = useState<{ id: number; value: string } | null>(null);
  const [paste, setPaste] = useState<{ theatre: TheatreRow; text: string; url: string } | null>(
    null
  );
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error" | "info";
  }>({ open: false, message: "", severity: "success" });

  const notify = useCallback(
    (message: string, severity: "success" | "error" | "info" = "success") =>
      setSnackbar({ open: true, message, severity }),
    []
  );

  const loadTheatres = useCallback(async () => {
    const res = await fetch("/api/admin/import/candidates");
    const data = await res.json();
    setTheatres(data.theatres ?? []);
    setLoadingTheatres(false);
  }, []);

  const loadCandidates = useCallback(async (theatreId: number) => {
    const res = await fetch(`/api/admin/import/candidates?theatreId=${theatreId}`);
    const data = await res.json();
    setCandidates(data.candidates ?? []);
    setSeasons(data.seasons ?? []);
  }, []);

  useEffect(() => {
    loadTheatres();
  }, [loadTheatres]);

  useEffect(() => {
    if (selected) loadCandidates(selected.id);
  }, [selected, loadCandidates]);

  async function runImport(theatre: TheatreRow, body: Record<string, unknown> = {}) {
    setRunning(theatre.id);
    try {
      const res = await fetch("/api/admin/import/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ theatreId: theatre.id, ...body }),
      });
      const data = await res.json();
      if (!res.ok) {
        notify(data.error || "Import failed.", "error");
        return null;
      }
      const s = data.summary as { status: string; error?: string; duplicates: number };
      if (s.status === "OK") {
        notify(
          `${theatre.name}: ${data.candidates.length} run(s) found, ${s.duplicates} already scheduled.`
        );
      } else {
        notify(
          `${theatre.name}: ${s.status}${s.error ? ` — ${s.error}` : ""}. Try "Paste page" instead.`,
          s.status === "EMPTY" ? "info" : "error"
        );
      }
      return data;
    } finally {
      setRunning(null);
    }
  }

  async function handleFetch(theatre: TheatreRow) {
    const data = await runImport(theatre);
    await loadTheatres();
    if (data) {
      setSelected(theatre);
      setCandidates(data.candidates ?? []);
    }
  }

  async function handleRunAll() {
    const targets = theatres.filter((t) => t.seasonUrl || t.link);
    setRunAll({ done: 0, total: targets.length });
    for (const [i, t] of targets.entries()) {
      await runImport(t);
      setRunAll({ done: i + 1, total: targets.length });
    }
    setRunAll(null);
    await loadTheatres();
  }

  async function handlePasteSubmit() {
    if (!paste) return;
    const theatre = paste.theatre;
    const data = await runImport(theatre, {
      html: paste.text,
      sourceUrl: paste.url || undefined,
    });
    setPaste(null);
    await loadTheatres();
    if (data) {
      setSelected(theatre);
      setCandidates(data.candidates ?? []);
    }
  }

  async function saveSeasonUrl(theatre: TheatreRow, value: string) {
    const res = await fetch("/api/admin/theatres", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: theatre.id, seasonUrl: value.trim() || null }),
    });
    if (res.ok) {
      notify("Season URL saved.");
      setEditingUrl(null);
      await loadTheatres();
    } else {
      notify("Failed to save URL.", "error");
    }
  }

  function onCandidateResolved(id: number, createdSeason?: Season) {
    setCandidates((prev) => prev.filter((c) => c.id !== id));
    if (createdSeason) setSeasons((prev) => [createdSeason, ...prev]);
    setTheatres((prev) =>
      prev.map((t) =>
        t.id === selected?.id ? { ...t, openCount: Math.max(0, t.openCount - 1) } : t
      )
    );
  }

  return (
    <AdminGuard>
      <Head>
        <title>Import Seasons • Admin • StageKeeper</title>
      </Head>
      <Box sx={{ maxWidth: 1200, mx: "auto", mt: 4, px: 2, pb: 8 }}>
        <Stack
          alignItems={{ xs: "flex-start", sm: "center" }}
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          mb={2}
          spacing={1}
        >
          <Typography variant="h5">
            <Link href="/admin" style={{ textDecoration: "none", color: "inherit" }}>
              Admin
            </Link>
            {" / Import seasons"}
          </Typography>
          <Button
            disabled={!!runAll || running !== null}
            startIcon={<DownloadIcon />}
            variant="outlined"
            onClick={handleRunAll}
          >
            {runAll ? `Fetching ${runAll.done}/${runAll.total}…` : "Fetch all theatres"}
          </Button>
        </Stack>
        <Typography color="text.secondary" sx={{ mb: 2 }} variant="body2">
          Fetch reads each theatre&apos;s season page and stages the shows it finds for review.
          Nothing is added to programming until you approve a row. Sites that block scripts or
          render titles as images: open the page in your browser, select all, copy, and use
          &quot;Paste page&quot;.
        </Typography>
        {runAll && <LinearProgress sx={{ mb: 2 }} />}

        <Paper sx={{ mb: 4, overflowX: "auto" }}>
          {loadingTheatres ? (
            <Box sx={{ p: 4, textAlign: "center" }}>
              <CircularProgress />
            </Box>
          ) : (
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Theatre</TableCell>
                  <TableCell>Season page</TableCell>
                  <TableCell>Latest season</TableCell>
                  <TableCell>Last fetch</TableCell>
                  <TableCell align="right">To review</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {theatres.map((t) => {
                  const url = t.seasonUrl ?? t.link;
                  const isEditing = editingUrl?.id === t.id;
                  return (
                    <TableRow
                      key={t.id}
                      hover
                      selected={selected?.id === t.id}
                      sx={{ cursor: "pointer" }}
                      onClick={() => setSelected(t)}
                    >
                      <TableCell>{t.name}</TableCell>
                      <TableCell sx={{ minWidth: 260 }} onClick={(e) => e.stopPropagation()}>
                        {isEditing ? (
                          <Stack direction="row" spacing={0.5}>
                            <TextField
                              autoFocus
                              fullWidth
                              placeholder="https://…/season"
                              size="small"
                              value={editingUrl.value}
                              onChange={(e) => setEditingUrl({ id: t.id, value: e.target.value })}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") saveSeasonUrl(t, editingUrl.value);
                                if (e.key === "Escape") setEditingUrl(null);
                              }}
                            />
                            <IconButton
                              aria-label="Save season URL"
                              size="small"
                              onClick={() => saveSeasonUrl(t, editingUrl.value)}
                            >
                              <SaveIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              aria-label="Cancel"
                              size="small"
                              onClick={() => setEditingUrl(null)}
                            >
                              <CloseIcon fontSize="small" />
                            </IconButton>
                          </Stack>
                        ) : (
                          <Stack alignItems="center" direction="row" spacing={0.5}>
                            {url ? (
                              <MuiLink
                                href={url}
                                rel="noreferrer"
                                sx={{
                                  maxWidth: 260,
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                }}
                                target="_blank"
                                variant="body2"
                              >
                                {url.replace(/^https?:\/\/(www\.)?/, "")}
                              </MuiLink>
                            ) : (
                              <Typography color="text.disabled" variant="body2">
                                no URL
                              </Typography>
                            )}
                            {!t.seasonUrl && url && (
                              <Tooltip title="Using the homepage; set a season page for better results">
                                <Chip label="home" size="small" variant="outlined" />
                              </Tooltip>
                            )}
                            <IconButton
                              aria-label="Edit season URL"
                              size="small"
                              onClick={() => setEditingUrl({ id: t.id, value: t.seasonUrl ?? "" })}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Stack>
                        )}
                      </TableCell>
                      <TableCell>
                        {t.latestSeason ? (
                          <Tooltip
                            title={`${fmtDate(t.latestSeason.startDate)} – ${fmtDate(
                              t.latestSeason.endDate
                            )}`}
                          >
                            <Chip
                              color={
                                new Date(t.latestSeason.endDate) < new Date() ? "default" : "info"
                              }
                              label={`${t.latestSeason.name} · ${t.latestSeason.showCount} show${
                                t.latestSeason.showCount === 1 ? "" : "s"
                              }${new Date(t.latestSeason.endDate) < new Date() ? " · ended" : ""}`}
                              size="small"
                              variant="outlined"
                            />
                          </Tooltip>
                        ) : (
                          <Typography color="text.disabled" variant="body2">
                            none
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        {t.lastRun ? (
                          <Tooltip title={t.lastRun.error ?? ""}>
                            <Chip
                              color={
                                t.lastRun.status === "OK"
                                  ? "success"
                                  : t.lastRun.status === "EMPTY"
                                    ? "default"
                                    : "warning"
                              }
                              label={`${t.lastRun.status}${
                                t.lastRun.status === "OK" ? ` · ${t.lastRun.itemCount}` : ""
                              } · ${fmtDate(t.lastRun.createdAt)}`}
                              size="small"
                              variant="outlined"
                            />
                          </Tooltip>
                        ) : (
                          <Typography color="text.disabled" variant="body2">
                            never
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell align="right">
                        {t.openCount > 0 && (
                          <Chip color="primary" label={t.openCount} size="small" />
                        )}
                      </TableCell>
                      <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                        <Stack direction="row" justifyContent="flex-end" spacing={0.5}>
                          <Tooltip title="Paste page text or HTML">
                            <IconButton
                              aria-label="Paste page"
                              size="small"
                              onClick={() => setPaste({ theatre: t, text: "", url: "" })}
                            >
                              <ContentPasteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Button
                            disabled={!url || running !== null}
                            size="small"
                            variant="outlined"
                            onClick={() => handleFetch(t)}
                          >
                            {running === t.id ? <CircularProgress size={16} /> : "Fetch"}
                          </Button>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </Paper>

        {selected && (
          <>
            <Divider sx={{ mb: 3 }} />
            <Stack alignItems="center" direction="row" justifyContent="space-between" mb={2}>
              <Typography variant="h6">{selected.name} — to review</Typography>
              <Chip label={`${candidates.length} open`} size="small" />
            </Stack>
            {candidates.length === 0 ? (
              <Typography color="text.secondary" variant="body2">
                Nothing to review. Fetch the season page or paste one to stage runs.
              </Typography>
            ) : (
              <Stack spacing={2}>
                {candidates.map((c) => (
                  <CandidateCard
                    key={c.id}
                    candidate={c}
                    seasons={seasons}
                    onError={(m) => notify(m, "error")}
                    onResolved={(createdSeason) => onCandidateResolved(c.id, createdSeason)}
                  />
                ))}
              </Stack>
            )}
          </>
        )}
      </Box>

      <Dialog fullWidth maxWidth="md" open={!!paste} onClose={() => setPaste(null)}>
        <DialogTitle>Paste season page — {paste?.theatre.name}</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Open the theatre&apos;s season page in your browser, select all (⌘A), copy, and paste
            here. Page source (HTML) works too and usually gives better titles.
          </DialogContentText>
          <TextField
            fullWidth
            label="Page URL (optional, recorded as the source)"
            size="small"
            sx={{ mb: 2 }}
            value={paste?.url ?? ""}
            onChange={(e) => paste && setPaste({ ...paste, url: e.target.value })}
          />
          <TextField
            fullWidth
            multiline
            label="Page text or HTML"
            minRows={10}
            value={paste?.text ?? ""}
            onChange={(e) => paste && setPaste({ ...paste, text: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPaste(null)}>Cancel</Button>
          <Button
            disabled={!paste?.text.trim() || running !== null}
            variant="contained"
            onClick={handlePasteSubmit}
          >
            Extract
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        autoHideDuration={5000}
        open={snackbar.open}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
      >
        <Alert severity={snackbar.severity} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </AdminGuard>
  );
}

interface CandidateCardProps {
  candidate: Candidate;
  seasons: Season[];
  onResolved: (createdSeason?: Season) => void;
  onError: (message: string) => void;
}

function CandidateCard({ candidate, seasons, onResolved, onError }: CandidateCardProps) {
  const matched: ShowOption | null = candidate.musicals
    ? { ...candidate.musicals, type: "MUSICAL" }
    : candidate.plays
      ? { ...candidate.plays, type: "PLAY" }
      : null;

  const [type, setType] = useState<PerformanceType>(candidate.matchType ?? "MUSICAL");
  const [show, setShow] = useState<ShowOption | null>(matched);
  const [newTitle, setNewTitle] = useState(matched ? "" : candidate.rawTitle);
  const [query, setQuery] = useState("");
  const [options, setOptions] = useState<ShowOption[]>([]);
  const [startDate, setStartDate] = useState(toDateInput(candidate.startDate));
  const [endDate, setEndDate] = useState(toDateInput(candidate.endDate));
  const [busy, setBusy] = useState(false);

  // Default to the season containing the start date, else the latest season if the run
  // plausibly belongs to it (approving extends its dates), else a new one.
  const containing = useMemo(() => {
    if (!startDate) return undefined;
    const d = new Date(startDate);
    const hit = seasons.find((s) => new Date(s.startDate) <= d && new Date(s.endDate) >= d);
    if (hit) return hit;
    const latest = seasons[0];
    if (!latest) return undefined;
    const daysAfterStart = (d.getTime() - new Date(latest.startDate).getTime()) / 86_400_000;
    return daysAfterStart >= 0 && daysAfterStart <= 400 ? latest : undefined;
  }, [seasons, startDate]);
  const [seasonId, setSeasonId] = useState<string>(containing ? String(containing.id) : NEW_SEASON);
  useEffect(() => {
    if (containing) setSeasonId(String(containing.id));
  }, [containing]);
  const [newSeasonName, setNewSeasonName] = useState(
    startDate && endDate ? defaultSeasonName(startDate, endDate) : ""
  );

  useEffect(() => {
    if (query.trim().length < 2) return;
    const handle = setTimeout(async () => {
      const res = await fetch(`/api/catalog/search?kind=shows&q=${encodeURIComponent(query)}`);
      const data = await res.json();
      setOptions(
        (data.results ?? []).map((r: ShowOption) => ({ id: r.id, type: r.type, title: r.title }))
      );
    }, 250);
    return () => clearTimeout(handle);
  }, [query]);

  const isDuplicate = candidate.state === "DUPLICATE";

  async function act(body: Record<string, unknown>) {
    setBusy(true);
    try {
      const res = await fetch("/api/admin/import/candidates", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: candidate.id, ...body }),
      });
      const data = await res.json();
      if (!res.ok) {
        onError(data.error || "Something went wrong.");
        return;
      }
      const created =
        body.action === "approve" && seasonId === NEW_SEASON
          ? {
              id: data.seasonId,
              name: newSeasonName,
              startDate,
              endDate,
            }
          : undefined;
      onResolved(created);
    } finally {
      setBusy(false);
    }
  }

  function approve() {
    if (!startDate || !endDate) return onError("Start and end dates are required.");
    if (seasonId === NEW_SEASON && !newSeasonName.trim()) return onError("Name the new season.");
    act({
      action: "approve",
      type,
      musicalId: show && type === "MUSICAL" ? show.id : undefined,
      playId: show && type === "PLAY" ? show.id : undefined,
      newShow: show ? undefined : { title: newTitle.trim() },
      seasonId: seasonId === NEW_SEASON ? undefined : Number(seasonId),
      newSeason:
        seasonId === NEW_SEASON
          ? {
              name: newSeasonName.trim(),
              // A new season spans at least this run; later approvals reuse it.
              startDate,
              endDate,
            }
          : undefined,
      startDate,
      endDate,
    });
  }

  return (
    <Paper sx={{ p: 2, opacity: isDuplicate ? 0.75 : 1 }}>
      <Stack
        alignItems={{ xs: "flex-start", sm: "center" }}
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        mb={1.5}
        spacing={1}
      >
        <Box>
          <Typography fontWeight={600} variant="subtitle1">
            {candidate.rawTitle}
          </Typography>
          <Typography color="text.secondary" variant="caption">
            {fmtDate(candidate.startDate)} – {fmtDate(candidate.endDate)}
            {candidate.snippet ? ` · “${candidate.snippet}”` : ""}
            {candidate.sourceUrl.startsWith("http") && (
              <>
                {" · "}
                <MuiLink href={candidate.sourceUrl} rel="noreferrer" target="_blank">
                  source
                </MuiLink>
              </>
            )}
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          {isDuplicate && (
            <Chip color="warning" label="already scheduled" size="small" variant="outlined" />
          )}
          {matched ? (
            <Chip color="success" label={`matched: ${matched.title}`} size="small" />
          ) : (
            <Chip label="no match — will create" size="small" variant="outlined" />
          )}
        </Stack>
      </Stack>

      <Stack direction={{ xs: "column", md: "row" }} spacing={1.5}>
        <TextField
          select
          label="Type"
          size="small"
          sx={{ minWidth: 120 }}
          value={type}
          onChange={(e) => setType(e.target.value as PerformanceType)}
        >
          <MenuItem value="MUSICAL">Musical</MenuItem>
          <MenuItem value="PLAY">Play</MenuItem>
        </TextField>
        <Autocomplete
          filterOptions={(x) => x}
          getOptionLabel={(o) => o.title}
          isOptionEqualToValue={(a, b) => a.id === b.id && a.type === b.type}
          options={options}
          renderInput={(params) => (
            <TextField {...params} label="Link to existing show" size="small" />
          )}
          renderOption={(props, o) => (
            <li {...props} key={`${o.type}-${o.id}`}>
              {o.title}
              <Chip label={o.type === "MUSICAL" ? "M" : "P"} size="small" sx={{ ml: 1 }} />
            </li>
          )}
          sx={{ flex: 1, minWidth: 220 }}
          value={show}
          onChange={(_, v) => {
            setShow(v);
            if (v) setType(v.type);
          }}
          onInputChange={(_, v) => setQuery(v)}
        />
        {!show && (
          <TextField
            label="…or create with title"
            size="small"
            sx={{ flex: 1, minWidth: 200 }}
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
          />
        )}
      </Stack>

      <Stack direction={{ xs: "column", md: "row" }} mt={1.5} spacing={1.5}>
        <TextField
          label="Start"
          size="small"
          slotProps={{ inputLabel: { shrink: true } }}
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
        <TextField
          label="End"
          size="small"
          slotProps={{ inputLabel: { shrink: true } }}
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />
        <TextField
          select
          label="Season"
          size="small"
          sx={{ minWidth: 200 }}
          value={seasonId}
          onChange={(e) => setSeasonId(e.target.value)}
        >
          <MenuItem value={NEW_SEASON}>New season…</MenuItem>
          {seasons.map((s) => (
            <MenuItem key={s.id} value={String(s.id)}>
              {s.name}
            </MenuItem>
          ))}
        </TextField>
        {seasonId === NEW_SEASON && (
          <TextField
            label="New season name"
            size="small"
            sx={{ minWidth: 180 }}
            value={newSeasonName}
            onChange={(e) => setNewSeasonName(e.target.value)}
          />
        )}
        <Box sx={{ flex: 1 }} />
        <Stack direction="row" spacing={1}>
          <Button
            disabled={busy}
            size="small"
            startIcon={<CloseIcon />}
            onClick={() => act({ action: "skip" })}
          >
            Skip
          </Button>
          <Button
            disabled={busy}
            size="small"
            startIcon={<CheckIcon />}
            variant="contained"
            onClick={approve}
          >
            Approve
          </Button>
        </Stack>
      </Stack>
    </Paper>
  );
}
