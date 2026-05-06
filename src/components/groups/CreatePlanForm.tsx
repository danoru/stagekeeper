import {
  Autocomplete,
  Box,
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import moment from "moment";
import { useRouter } from "next/router";
import { useMemo, useState } from "react";

import type { ProgrammingOption } from "./GroupPlans";

interface Props {
  groupId: number;
  programmingOptions: ProgrammingOption[];
  onResult: (result: { ok: true } | { ok: false; error: string }) => void;
}

const CANDIDATE_CAP = 90;

type ShowKey = string; // "MUSICAL-123" | "PLAY-456"

interface ShowChoice {
  key: ShowKey;
  type: "MUSICAL" | "PLAY";
  showId: number;
  title: string;
}

interface TheatreChoice {
  theatreId: number;
  theatreName: string;
  programmings: ProgrammingOption[];
}

function groupShows(options: ProgrammingOption[]): ShowChoice[] {
  const seen = new Map<ShowKey, ShowChoice>();
  for (const p of options) {
    const showId = p.type === "MUSICAL" ? p.musical : p.play;
    const show = p.type === "MUSICAL" ? p.musicals : p.plays;
    if (!showId || !show || !p.seasons?.theatres) continue;
    const key: ShowKey = `${p.type}-${showId}`;
    if (!seen.has(key)) {
      seen.set(key, { key, type: p.type, showId, title: show.title });
    }
  }
  return Array.from(seen.values()).sort((a, b) => a.title.localeCompare(b.title));
}

function theatresForShow(
  options: ProgrammingOption[],
  show: ShowChoice
): TheatreChoice[] {
  const byTheatre = new Map<number, TheatreChoice>();
  for (const p of options) {
    const showId = p.type === "MUSICAL" ? p.musical : p.play;
    if (showId !== show.showId || p.type !== show.type) continue;
    const theatre = p.seasons?.theatres;
    if (!theatre) continue;
    let bucket = byTheatre.get(theatre.id);
    if (!bucket) {
      bucket = { theatreId: theatre.id, theatreName: theatre.name, programmings: [] };
      byTheatre.set(theatre.id, bucket);
    }
    bucket.programmings.push(p);
  }
  return Array.from(byTheatre.values()).sort((a, b) =>
    a.theatreName.localeCompare(b.theatreName)
  );
}

function expandShowtimes(p: ProgrammingOption, cap = CANDIDATE_CAP): Date[] {
  const raw = p.dayTimes;
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return [];
  const dayTimes = raw as Record<string, string[]>;

  const now = new Date();
  const cursor = new Date(p.startDate);
  cursor.setHours(0, 0, 0, 0);
  const end = new Date(p.endDate);
  const out: Date[] = [];

  while (cursor <= end && out.length < cap) {
    const dayName = cursor.toLocaleDateString("en-US", { weekday: "long" });
    const times = dayTimes[dayName];
    if (Array.isArray(times)) {
      for (const time of times) {
        const [h, m] = time.split(":").map(Number);
        if (Number.isNaN(h) || Number.isNaN(m)) continue;
        const dt = new Date(cursor);
        dt.setHours(h, m, 0, 0);
        if (dt > now) out.push(dt);
        if (out.length >= cap) break;
      }
    }
    cursor.setDate(cursor.getDate() + 1);
  }
  return out;
}

function combinedShowtimes(programmings: ProgrammingOption[]): Date[] {
  const seen = new Set<string>();
  const out: Date[] = [];
  for (const p of programmings) {
    for (const dt of expandShowtimes(p)) {
      const iso = dt.toISOString();
      if (seen.has(iso)) continue;
      seen.add(iso);
      out.push(dt);
    }
  }
  return out.sort((a, b) => a.getTime() - b.getTime());
}

function CreatePlanForm({ groupId, programmingOptions, onResult }: Props) {
  const router = useRouter();
  const [show, setShow] = useState<ShowChoice | null>(null);
  const [theatre, setTheatre] = useState<TheatreChoice | null>(null);
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const [customInput, setCustomInput] = useState("");
  const [customs, setCustoms] = useState<string[]>([]);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const shows = useMemo(() => groupShows(programmingOptions), [programmingOptions]);
  const theatres = useMemo(
    () => (show ? theatresForShow(programmingOptions, show) : []),
    [show, programmingOptions]
  );
  const showtimes = useMemo(
    () => (theatre ? combinedShowtimes(theatre.programmings) : []),
    [theatre]
  );

  function handleShowChange(value: ShowChoice | null) {
    setShow(value);
    setTheatre(null);
    setPicked(new Set());
    setCustoms([]);
  }

  function handleTheatreChange(theatreId: number) {
    const next = theatres.find((t) => t.theatreId === theatreId) ?? null;
    setTheatre(next);
    setPicked(new Set());
    setCustoms([]);
  }

  function togglePick(iso: string) {
    setPicked((prev) => {
      const next = new Set(prev);
      if (next.has(iso)) next.delete(iso);
      else next.add(iso);
      return next;
    });
  }

  function addCustom() {
    if (!customInput) return;
    const dt = new Date(customInput);
    if (Number.isNaN(dt.getTime())) {
      setError("Invalid custom date.");
      return;
    }
    const iso = dt.toISOString();
    if (!customs.includes(iso)) setCustoms((c) => [...c, iso]);
    setCustomInput("");
    setError(null);
  }

  function removeCustom(iso: string) {
    setCustoms((c) => c.filter((x) => x !== iso));
  }

  const allChosen = [...picked, ...customs];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!theatre || allChosen.length === 0) return;
    const chosenDates = allChosen.map((iso) => new Date(iso)).sort(
      (a, b) => a.getTime() - b.getTime()
    );
    const earliest = chosenDates[0];
    const programming =
      theatre.programmings.find(
        (p) => earliest >= new Date(p.startDate) && earliest <= new Date(p.endDate)
      ) ?? theatre.programmings[0];

    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/groups/${groupId}/plans`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          programmingId: programming.id,
          startTimes: allChosen,
          note,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        const message = body.error ?? "Failed to create plan.";
        setError(message);
        onResult({ ok: false, error: message });
        return;
      }
      await router.replace(router.asPath, undefined, { scroll: false });
      onResult({ ok: true });
    } finally {
      setBusy(false);
    }
  }

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        border: "1px solid rgba(212,175,85,0.15)",
        borderRadius: 1,
        p: 2.5,
        background: "rgba(212,175,85,0.03)",
      }}
    >
      <Autocomplete
        getOptionLabel={(o) => o.title}
        isOptionEqualToValue={(a, b) => a.key === b.key}
        onChange={(_, value) => handleShowChange(value)}
        options={shows}
        renderInput={(params) => (
          <TextField {...params} placeholder="Pick a show" size="small" />
        )}
        size="small"
        sx={{ mb: 2 }}
        value={show}
      />

      {show && (
        <FormControl fullWidth size="small" sx={{ mb: 2 }}>
          <InputLabel>Theatre</InputLabel>
          <Select
            label="Theatre"
            onChange={(e) => handleTheatreChange(Number(e.target.value))}
            value={theatre?.theatreId ?? ""}
          >
            {theatres.length === 0 && (
              <MenuItem disabled value="">
                No upcoming runs at any theatre
              </MenuItem>
            )}
            {theatres.map((t) => (
              <MenuItem key={t.theatreId} value={t.theatreId}>
                {t.theatreName}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}

      {theatre && showtimes.length === 0 && customs.length === 0 && (
        <Typography
          sx={{
            fontFamily: '"DM Sans", sans-serif',
            fontStyle: "italic",
            fontSize: "0.72rem",
            color: "rgba(232,220,200,0.4)",
            mb: 1.5,
          }}
        >
          No future showtimes from this run&rsquo;s schedule. Add a custom
          date/time below.
        </Typography>
      )}

      {theatre && showtimes.length > 0 && (
        <Box
          sx={{
            border: "1px solid rgba(212,175,85,0.08)",
            borderRadius: 1,
            maxHeight: 260,
            overflowY: "auto",
            mb: 2,
            p: 1,
          }}
        >
          <Typography
            sx={{
              fontFamily: '"DM Sans", sans-serif',
              fontSize: "0.6rem",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "rgba(212,175,85,0.6)",
              px: 1,
              pt: 0.5,
              pb: 1,
            }}
          >
            Pick candidate dates
          </Typography>
          <Stack>
            {showtimes.map((dt) => {
              const iso = dt.toISOString();
              return (
                <FormControlLabel
                  key={iso}
                  control={
                    <Checkbox
                      checked={picked.has(iso)}
                      onChange={() => togglePick(iso)}
                      size="small"
                      sx={{ color: "rgba(212,175,85,0.4)" }}
                    />
                  }
                  label={
                    <Typography
                      sx={{
                        fontFamily: '"DM Sans", sans-serif',
                        fontSize: "0.78rem",
                        color: "#E8DCC8",
                      }}
                    >
                      {moment(dt).format("ddd, MMM D · h:mm A")}
                    </Typography>
                  }
                  sx={{ mx: 1, my: 0 }}
                />
              );
            })}
          </Stack>
        </Box>
      )}

      {theatre && (
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
            <TextField
              InputLabelProps={{ shrink: true }}
              label="Add a custom date/time"
              onChange={(e) => setCustomInput(e.target.value)}
              size="small"
              sx={{ flex: 1 }}
              type="datetime-local"
              value={customInput}
            />
            <Button disabled={!customInput} onClick={addCustom} variant="outlined">
              Add
            </Button>
          </Box>
          {customs.length > 0 && (
            <Stack direction="row" flexWrap="wrap" gap={0.75} sx={{ mt: 1.25 }}>
              {customs.map((iso) => (
                <Box
                  key={iso}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0.75,
                    px: 1,
                    py: 0.5,
                    border: "1px solid rgba(212,175,85,0.3)",
                    borderRadius: 0.5,
                    background: "rgba(212,175,85,0.06)",
                  }}
                >
                  <Typography
                    sx={{
                      fontFamily: '"DM Sans", sans-serif',
                      fontSize: "0.7rem",
                      color: "#D4AF55",
                    }}
                  >
                    {moment(iso).format("ddd, MMM D · h:mm A")}
                  </Typography>
                  <Button
                    onClick={() => removeCustom(iso)}
                    size="small"
                    sx={{ minWidth: 0, p: 0.25, fontSize: "0.7rem", color: "#CF4444" }}
                  >
                    ×
                  </Button>
                </Box>
              ))}
            </Stack>
          )}
        </Box>
      )}

      <TextField
        fullWidth
        inputProps={{ maxLength: 500 }}
        multiline
        onChange={(e) => setNote(e.target.value)}
        placeholder="Add a note (optional)"
        rows={2}
        size="small"
        sx={{ mb: 2 }}
        value={note}
      />

      <Box sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
        <Button
          disabled={busy || !theatre || allChosen.length === 0}
          type="submit"
          variant="outlined"
        >
          Start poll
        </Button>
        {error && (
          <Typography sx={{ color: "#CF4444", fontSize: "0.7rem" }}>{error}</Typography>
        )}
        <Box sx={{ flex: 1 }} />
        <Typography
          sx={{
            fontFamily: '"DM Sans", sans-serif',
            fontSize: "0.65rem",
            color: "rgba(232,220,200,0.4)",
          }}
        >
          {allChosen.length} {allChosen.length === 1 ? "date" : "dates"} selected
        </Typography>
      </Box>

      {shows.length === 0 && (
        <Typography
          sx={{
            fontFamily: '"DM Sans", sans-serif',
            fontStyle: "italic",
            fontSize: "0.7rem",
            color: "rgba(232,220,200,0.4)",
            mt: 1.5,
          }}
        >
          No upcoming runs found. Ask an admin to add programming for the show
          you want to plan.
        </Typography>
      )}
    </Box>
  );
}

export default CreatePlanForm;
