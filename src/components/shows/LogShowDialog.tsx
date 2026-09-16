import AddIcon from "@mui/icons-material/Add";
import {
  Autocomplete,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  Link,
  MenuItem,
  Rating,
  Select,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import type { PerformanceType, performances, theatres } from "@prisma/client";
import moment from "moment";
import { useEffect, useMemo, useState } from "react";

import type { ShowSearchResult } from "../../data/catalog";

export type LogMode = "seen" | "going";

export interface PresetShow {
  id: number;
  title: string;
  type: PerformanceType;
}

interface TheatreOption {
  id: number;
  name: string;
  location: string;
  status?: string;
}

type ShowOption = ShowSearchResult | { kind: "new"; title: string };
type TheatreChoice = TheatreOption | { kind: "new"; name: string };

interface Props {
  initialMode?: LogMode;
  onClose: () => void;
  /** Called after a successful log with the show that was logged. */
  onLogged: (result: { show: PresetShow; mode: LogMode }) => void;
  open: boolean;
  /** Admin-entered performances for the preset show, if any. */
  pastPerformances?: (performances & { theatres: theatres })[];
  /** When set, the show picker is skipped. */
  preset?: PresetShow;
}

function useDebounced<T>(value: T, ms: number) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return debounced;
}

const eyebrowSx = {
  fontFamily: '"DM Sans", sans-serif',
  fontSize: "0.62rem",
  letterSpacing: "0.18em",
  textTransform: "uppercase",
  color: "rgba(232,220,200,0.5)",
  mb: 0.75,
};

const subtleLinkSx = {
  fontFamily: '"DM Sans", sans-serif',
  fontSize: "0.78rem",
  color: "rgba(212,175,85,0.7)",
  textAlign: "left",
  alignSelf: "flex-start",
};

/**
 * One dialog for every way a show gets onto someone's record: "I saw it" (past, with an
 * optional rating) or "I'm going" (future date). Shows and theatres that aren't in the
 * catalog yet can be added inline — they land as PENDING for an admin to tidy up later.
 */
export default function LogShowDialog({
  initialMode = "seen",
  onClose,
  onLogged,
  open,
  pastPerformances = [],
  preset,
}: Props) {
  const today = moment().format("YYYY-MM-DD");

  const [mode, setMode] = useState<LogMode>(initialMode);

  // Show picker
  const [showQuery, setShowQuery] = useState("");
  const [showOptions, setShowOptions] = useState<ShowSearchResult[]>([]);
  const [showLoading, setShowLoading] = useState(false);
  const [show, setShow] = useState<ShowOption | null>(null);
  const [newShowType, setNewShowType] = useState<PerformanceType>("MUSICAL");
  const [newShowYear, setNewShowYear] = useState("");
  const debouncedShowQuery = useDebounced(showQuery, 250);

  // Specific performance (legacy admin-entered rows)
  const [performanceId, setPerformanceId] = useState<number | "">("");

  // Theatre picker
  const [theatreQuery, setTheatreQuery] = useState("");
  const [theatreOptions, setTheatreOptions] = useState<TheatreOption[]>([]);
  const [theatreLoading, setTheatreLoading] = useState(false);
  const [theatre, setTheatre] = useState<TheatreChoice | null>(null);
  const [newTheatreLocation, setNewTheatreLocation] = useState("");
  const debouncedTheatreQuery = useDebounced(theatreQuery, 250);

  const [seenDate, setSeenDate] = useState("");
  const [rating, setRating] = useState<number | null>(null);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) setMode(initialMode);
  }, [open, initialMode]);

  useEffect(() => {
    if (!open || preset) return;
    const q = debouncedShowQuery.trim();
    if (q.length < 2) {
      setShowOptions([]);
      return;
    }
    let cancelled = false;
    setShowLoading(true);
    fetch(`/api/catalog/search?q=${encodeURIComponent(q)}`)
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) setShowOptions(data.results ?? []);
      })
      .catch(() => undefined)
      .finally(() => {
        if (!cancelled) setShowLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [debouncedShowQuery, open, preset]);

  useEffect(() => {
    if (!open) return;
    const q = debouncedTheatreQuery.trim();
    if (q.length < 2) {
      setTheatreOptions([]);
      return;
    }
    let cancelled = false;
    setTheatreLoading(true);
    fetch(`/api/catalog/search?kind=theatres&q=${encodeURIComponent(q)}`)
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) setTheatreOptions(data.results ?? []);
      })
      .catch(() => undefined)
      .finally(() => {
        if (!cancelled) setTheatreLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [debouncedTheatreQuery, open]);

  function reset() {
    setMode(initialMode);
    setShowQuery("");
    setShowOptions([]);
    setShow(null);
    setNewShowType("MUSICAL");
    setNewShowYear("");
    setPerformanceId("");
    setTheatreQuery("");
    setTheatreOptions([]);
    setTheatre(null);
    setNewTheatreLocation("");
    setSeenDate("");
    setRating(null);
    setComment("");
    setError(null);
  }

  function handleClose() {
    if (submitting) return;
    onClose();
    setTimeout(reset, 200);
  }

  const showTitle = preset?.title ?? (show && "title" in show ? show.title : "");
  const isNewShow = !preset && show !== null && "kind" in show;
  const isNewTheatre = theatre !== null && "kind" in theatre;
  const usingPerformance = mode === "seen" && performanceId !== "";

  const showChoices = useMemo<ShowOption[]>(() => {
    const q = showQuery.trim();
    const exact = showOptions.some((o) => o.title.toLowerCase() === q.toLowerCase());
    const list: ShowOption[] = [...showOptions];
    if (q.length >= 2 && !exact) list.push({ kind: "new", title: q });
    return list;
  }, [showOptions, showQuery]);

  const theatreChoices = useMemo<TheatreChoice[]>(() => {
    const q = theatreQuery.trim();
    const exact = theatreOptions.some((o) => o.name.toLowerCase() === q.toLowerCase());
    const list: TheatreChoice[] = [...theatreOptions];
    if (q.length >= 2 && !exact) list.push({ kind: "new", name: q });
    return list;
  }, [theatreOptions, theatreQuery]);

  const canSubmit =
    !submitting &&
    (preset || show) &&
    (mode === "seen" || seenDate) &&
    (!isNewTheatre || newTheatreLocation.trim());

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);
    try {
      // 1. Resolve the show (create it if needed).
      let resolved: PresetShow;
      if (preset) {
        resolved = preset;
      } else if (show && "kind" in show) {
        const res = await fetch("/api/catalog/shows", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: newShowType,
            title: show.title,
            premiereYear: newShowYear || null,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Could not add that show.");
        resolved = { id: data.show.id, title: data.show.title, type: data.show.type };
      } else if (show) {
        resolved = { id: show.id, title: show.title, type: show.type };
      } else {
        throw new Error("Pick a show first.");
      }

      // 2. Resolve the theatre (create it if needed).
      let theatreId: number | null = null;
      if (theatre && "kind" in theatre) {
        const res = await fetch("/api/catalog/theatres", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: theatre.name, location: newTheatreLocation }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Could not add that theatre.");
        theatreId = data.theatre.id;
      } else if (theatre) {
        theatreId = theatre.id;
      }

      // 3. Log it.
      const payload = usingPerformance
        ? { performanceId, rating, comment: comment.trim() || null }
        : {
            type: resolved.type,
            musicalId: resolved.type === "MUSICAL" ? resolved.id : undefined,
            playId: resolved.type === "PLAY" ? resolved.id : undefined,
            theatreId,
            seenDate: seenDate || null,
            rating: mode === "seen" ? rating : null,
            comment: comment.trim() || null,
            going: mode === "going",
          };
      const res = await fetch("/api/shows/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to log.");

      onLogged({ show: resolved, mode });
      onClose();
      setTimeout(reset, 200);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog fullWidth maxWidth="sm" open={open} onClose={handleClose}>
      <DialogTitle
        sx={{ fontFamily: '"Cormorant Garamond", serif', fontSize: "1.4rem", color: "#E8DCC8" }}
      >
        {mode === "going" ? "I'm going to" : "Log a viewing of"} {showTitle || "a show"}
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2.5} sx={{ mt: 1 }}>
          <ToggleButtonGroup
            exclusive
            fullWidth
            size="small"
            value={mode}
            onChange={(_, v: LogMode | null) => {
              if (v) {
                setMode(v);
                setPerformanceId("");
                if (v === "going" && seenDate && seenDate < today) setSeenDate("");
              }
            }}
          >
            <ToggleButton value="seen">I saw it</ToggleButton>
            <ToggleButton value="going">I&apos;m going</ToggleButton>
          </ToggleButtonGroup>

          {!preset && (
            <Box>
              <Autocomplete<ShowOption, false, false, false>
                autoHighlight
                filterOptions={(x) => x}
                getOptionLabel={(o) => o.title}
                inputValue={showQuery}
                isOptionEqualToValue={(a, b) =>
                  "kind" in a || "kind" in b
                    ? a.title === b.title
                    : a.type === b.type && a.id === b.id
                }
                loading={showLoading}
                noOptionsText={showQuery.trim().length < 2 ? "Type a show title…" : "No matches"}
                options={showChoices}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    autoFocus
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {showLoading ? <CircularProgress color="inherit" size={16} /> : null}
                          {params.InputProps.endAdornment}
                        </>
                      ),
                    }}
                    label="Show"
                    placeholder="Search musicals and plays"
                    size="small"
                  />
                )}
                renderOption={(props, option) => {
                  const { key, ...rest } = props as typeof props & { key: string };
                  if ("kind" in option) {
                    return (
                      <li key={key} {...rest}>
                        <AddIcon fontSize="small" sx={{ mr: 1, color: "#D4AF55" }} />
                        Add &ldquo;{option.title}&rdquo; as a new show
                      </li>
                    );
                  }
                  return (
                    <li key={key} {...rest}>
                      <Stack alignItems="center" direction="row" spacing={1} sx={{ width: "100%" }}>
                        <Typography sx={{ flex: 1 }}>{option.title}</Typography>
                        {option.premiere && (
                          <Typography sx={{ color: "rgba(232,220,200,0.4)", fontSize: "0.75rem" }}>
                            {moment(option.premiere).format("YYYY")}
                          </Typography>
                        )}
                        <Chip
                          label={option.type === "MUSICAL" ? "Musical" : "Play"}
                          size="small"
                          variant="outlined"
                        />
                        {option.status === "PENDING" && (
                          <Chip color="warning" label="new" size="small" variant="outlined" />
                        )}
                      </Stack>
                    </li>
                  );
                }}
                value={show}
                onChange={(_, v) => setShow(v)}
                onInputChange={(_, v, reason) => {
                  if (reason !== "reset") setShowQuery(v);
                  else if (v) setShowQuery(v);
                }}
              />
              {isNewShow && (
                <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ mt: 1.5 }}>
                  <ToggleButtonGroup
                    exclusive
                    size="small"
                    value={newShowType}
                    onChange={(_, v: PerformanceType | null) => v && setNewShowType(v)}
                  >
                    <ToggleButton value="MUSICAL">Musical</ToggleButton>
                    <ToggleButton value="PLAY">Play</ToggleButton>
                  </ToggleButtonGroup>
                  <TextField
                    inputProps={{ inputMode: "numeric", maxLength: 4 }}
                    label="Premiere year (optional)"
                    size="small"
                    value={newShowYear}
                    onChange={(e) => setNewShowYear(e.target.value.replace(/\D/g, ""))}
                  />
                </Stack>
              )}
            </Box>
          )}

          {usingPerformance ? (
            <>
              <FormControl fullWidth size="small">
                <InputLabel id="performance-select-label">Performance</InputLabel>
                <Select
                  label="Performance"
                  labelId="performance-select-label"
                  value={performanceId}
                  onChange={(e) => setPerformanceId(Number(e.target.value))}
                >
                  {pastPerformances.map((p) => (
                    <MenuItem key={p.id} value={p.id}>
                      {moment(p.startTime).format("MMM D, YYYY")} — {p.theatres.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Link
                component="button"
                sx={subtleLinkSx}
                type="button"
                underline="hover"
                onClick={() => setPerformanceId("")}
              >
                Enter the date and theatre myself
              </Link>
            </>
          ) : (
            <>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <TextField
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  inputProps={mode === "going" ? { min: today } : { max: today }}
                  label={mode === "going" ? "Date" : "Date (optional)"}
                  required={mode === "going"}
                  size="small"
                  type="date"
                  value={seenDate}
                  onChange={(e) => setSeenDate(e.target.value)}
                />
                <Autocomplete<TheatreChoice, false, false, false>
                  autoHighlight
                  fullWidth
                  filterOptions={(x) => x}
                  getOptionLabel={(o) => o.name}
                  inputValue={theatreQuery}
                  isOptionEqualToValue={(a, b) =>
                    "kind" in a || "kind" in b ? a.name === b.name : a.id === b.id
                  }
                  loading={theatreLoading}
                  noOptionsText={
                    theatreQuery.trim().length < 2 ? "Type a theatre name…" : "No matches"
                  }
                  options={theatreChoices}
                  renderInput={(params) => (
                    <TextField {...params} label="Theatre (optional)" size="small" />
                  )}
                  renderOption={(props, option) => {
                    const { key, ...rest } = props as typeof props & { key: string };
                    if ("kind" in option) {
                      return (
                        <li key={key} {...rest}>
                          <AddIcon fontSize="small" sx={{ mr: 1, color: "#D4AF55" }} />
                          Add &ldquo;{option.name}&rdquo;
                        </li>
                      );
                    }
                    return (
                      <li key={key} {...rest}>
                        <Box>
                          <Typography>{option.name}</Typography>
                          {option.location && (
                            <Typography
                              sx={{ color: "rgba(232,220,200,0.4)", fontSize: "0.75rem" }}
                            >
                              {option.location}
                            </Typography>
                          )}
                        </Box>
                      </li>
                    );
                  }}
                  value={theatre}
                  onChange={(_, v) => setTheatre(v)}
                  onInputChange={(_, v, reason) => {
                    if (reason !== "reset") setTheatreQuery(v);
                    else if (v) setTheatreQuery(v);
                  }}
                />
              </Stack>
              {isNewTheatre && (
                <TextField
                  fullWidth
                  required
                  label="Where is it? (city, state)"
                  size="small"
                  value={newTheatreLocation}
                  onChange={(e) => setNewTheatreLocation(e.target.value)}
                />
              )}
              {mode === "seen" && pastPerformances.length > 0 && (
                <Link
                  component="button"
                  sx={subtleLinkSx}
                  type="button"
                  underline="hover"
                  onClick={() => setPerformanceId(pastPerformances[0].id)}
                >
                  Pick a specific performance instead
                </Link>
              )}
            </>
          )}

          {mode === "seen" && (
            <Box>
              <Typography sx={eyebrowSx}>Rating</Typography>
              <Rating
                precision={0.5}
                sx={{
                  "& .MuiRating-iconFilled": { color: "#D4AF55" },
                  "& .MuiRating-iconEmpty": { color: "rgba(212,175,85,0.25)" },
                }}
                value={rating}
                onChange={(_, v) => setRating(v)}
              />
            </Box>
          )}

          <TextField
            fullWidth
            multiline
            inputProps={{ maxLength: 500 }}
            label="Note (optional)"
            maxRows={4}
            minRows={2}
            placeholder={
              mode === "going" ? "Who's coming, which seats…" : "Memorable moments, cast standouts…"
            }
            size="small"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />

          {error && <Typography sx={{ color: "#E57373", fontSize: "0.8rem" }}>{error}</Typography>}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button disabled={submitting} onClick={handleClose}>
          Cancel
        </Button>
        <Button
          disabled={!canSubmit}
          sx={{ background: "#D4AF55", color: "#0D1520", "&:hover": { background: "#E8C76A" } }}
          variant="contained"
          onClick={handleSubmit}
        >
          {submitting ? "Saving…" : mode === "going" ? "Mark as going" : "Log viewing"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
