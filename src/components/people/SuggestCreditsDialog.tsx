import AddIcon from "@mui/icons-material/Add";
import DeleteOutline from "@mui/icons-material/DeleteOutline";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import type { CreditCategory } from "@prisma/client";
import { useEffect, useState } from "react";

import type { PersonSearchResult } from "../../data/people";

import { CATEGORY_LABELS, usesCharacter } from "./creditText";
import { parseCreditLines, type ColumnOrder } from "./parseCredits";

interface Row {
  key: number;
  personId: number | null;
  name: string;
  part: string;
}

interface Props {
  open: boolean;
  programmingId: number;
  /** "Little Shop of Horrors at La Mirada, 2025" */
  productionLabel: string;
  isAdmin: boolean;
  onClose: () => void;
}

let nextKey = 1;
const blankRow = (): Row => ({ key: nextKey++, personId: null, name: "", part: "" });

function PersonField({ row, onChange }: { row: Row; onChange: (row: Row) => void }) {
  const [options, setOptions] = useState<PersonSearchResult[]>([]);

  useEffect(() => {
    const q = row.name.trim();
    if (q.length < 2 || row.personId) {
      setOptions([]);
      return;
    }
    const t = setTimeout(() => {
      fetch(`/api/people/search?q=${encodeURIComponent(q)}`)
        .then((r) => (r.ok ? r.json() : []))
        .then(setOptions)
        .catch(() => setOptions([]));
    }, 200);
    return () => clearTimeout(t);
  }, [row.name, row.personId]);

  // Exact-name matches among the results; with two or more, the suggester has to pick.
  const typed = row.name.trim().toLowerCase();
  const sameName = options.filter((o) => o.name.toLowerCase() === typed).length;

  return (
    <Autocomplete
      freeSolo
      filterOptions={(x) => x}
      getOptionLabel={(o) => (typeof o === "string" ? o : o.name)}
      inputValue={row.name}
      options={options}
      renderInput={(params) => (
        <TextField
          {...params}
          helperText={
            row.name.trim().length < 2
              ? " "
              : row.personId
                ? "Existing person"
                : sameName > 1
                  ? `${sameName} people have this name. Pick one`
                  : "New person"
          }
          label="Name"
          size="small"
        />
      )}
      renderOption={(props, option) => (
        <li {...props} key={option.id}>
          <Box>
            <Typography sx={{ fontSize: "0.9rem" }}>
              {option.name}
              {option.disambiguator && (
                <Box component="span" sx={{ color: "text.secondary" }}>
                  {` · ${option.disambiguator}`}
                </Box>
              )}
            </Typography>
            {option.latest && (
              <Typography sx={{ fontSize: "0.72rem", color: "text.secondary" }}>
                {option.latest}
              </Typography>
            )}
          </Box>
        </li>
      )}
      sx={{ flex: 1, minWidth: 0 }}
      onChange={(_, value) => {
        if (value && typeof value !== "string") {
          onChange({ ...row, personId: value.id, name: value.name });
        }
      }}
      onInputChange={(_, value, reason) => {
        if (reason === "input") onChange({ ...row, personId: null, name: value });
      }}
    />
  );
}

function SuggestCreditsDialog({ open, programmingId, productionLabel, isAdmin, onClose }: Props) {
  const [category, setCategory] = useState<CreditCategory>("CAST");
  const [rows, setRows] = useState<Row[]>([blankRow()]);
  const [paste, setPaste] = useState("");
  const [order, setOrder] = useState<ColumnOrder>("name-first");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);

  const partLabel =
    category === "UNDERSTUDY"
      ? "Covers (or Swing)"
      : usesCharacter(category)
        ? "Character"
        : category === "MUSICIAN"
          ? "Instrument"
          : "Role";

  function update(row: Row) {
    setRows((rs) => rs.map((r) => (r.key === row.key ? row : r)));
  }

  function addPasted() {
    const parsed = parseCreditLines(paste, order).map((p) => ({
      key: nextKey++,
      personId: null,
      name: p.name,
      part: p.part,
    }));
    if (parsed.length === 0) return;
    // Replace the empty starter row rather than leaving it dangling at the top.
    setRows((rs) => [...rs.filter((r) => r.name.trim()), ...parsed]);
    setPaste("");
  }

  function reset() {
    setRows([blankRow()]);
    setPaste("");
    setError(null);
    setDone(null);
  }

  async function submit() {
    const credits = rows
      .filter((r) => r.name.trim().length >= 2)
      .map((r) => ({
        personId: r.personId,
        name: r.name.trim(),
        category,
        character: usesCharacter(category) ? r.part.trim() || null : null,
        role: usesCharacter(category) ? null : r.part.trim() || null,
      }));
    if (credits.length === 0) {
      setError("Add at least one name.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/credits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ programmingId, credits }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error ?? "Couldn't send those credits.");
      const skipped = body.skipped ? ` (${body.skipped} already listed)` : "";
      setDone(
        isAdmin
          ? `Added ${body.created} credit${body.created === 1 ? "" : "s"}${skipped}.`
          : `Thanks! ${body.created} credit${body.created === 1 ? "" : "s"} sent for review${skipped}.`
      );
      setRows([blankRow()]);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog
      fullWidth
      maxWidth="sm"
      open={open}
      onClose={() => {
        reset();
        onClose();
      }}
    >
      <DialogTitle>
        Suggest cast &amp; crew
        <Typography sx={{ fontSize: "0.8rem", color: "text.secondary" }}>
          {productionLabel}
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          {!isAdmin && (
            <Typography sx={{ fontSize: "0.8rem", color: "text.secondary" }}>
              An admin reviews suggestions before they appear.
            </Typography>
          )}
          <ToggleButtonGroup
            exclusive
            size="small"
            value={category}
            onChange={(_, v) => {
              if (!v) return;
              setCategory(v);
              setOrder(usesCharacter(v) ? "name-first" : "part-first");
            }}
          >
            {(Object.keys(CATEGORY_LABELS) as CreditCategory[]).map((c) => (
              <ToggleButton key={c} value={c}>
                {CATEGORY_LABELS[c]}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>

          <Box>
            <TextField
              fullWidth
              multiline
              label="Paste a list (optional)"
              minRows={3}
              placeholder={
                category === "CAST"
                  ? "Jane Doe as Audrey\nJohn Smith — Seymour"
                  : "Director: Sam Lee\nChoreographer — Ana Ruiz"
              }
              size="small"
              value={paste}
              onChange={(e) => setPaste(e.target.value)}
            />
            <Stack alignItems="center" direction="row" spacing={1} sx={{ mt: 1, flexWrap: "wrap" }}>
              <ToggleButtonGroup
                exclusive
                size="small"
                value={order}
                onChange={(_, v) => v && setOrder(v)}
              >
                <ToggleButton value="name-first">Name first</ToggleButton>
                <ToggleButton value="part-first">{`${partLabel} first`}</ToggleButton>
              </ToggleButtonGroup>
              <Button disabled={!paste.trim()} size="small" onClick={addPasted}>
                Add to list
              </Button>
            </Stack>
          </Box>

          <Stack spacing={1}>
            {rows.map((row) => (
              <Stack key={row.key} alignItems="flex-start" direction="row" spacing={1}>
                <PersonField row={row} onChange={update} />
                <TextField
                  helperText=" "
                  label={partLabel}
                  size="small"
                  sx={{ flex: 1, minWidth: 0 }}
                  value={row.part}
                  onChange={(e) => update({ ...row, part: e.target.value })}
                />
                <IconButton
                  aria-label="Remove this row"
                  size="small"
                  sx={{ mt: 0.5 }}
                  onClick={() =>
                    setRows((rs) =>
                      rs.length > 1 ? rs.filter((r) => r.key !== row.key) : [blankRow()]
                    )
                  }
                >
                  <DeleteOutline fontSize="small" />
                </IconButton>
              </Stack>
            ))}
            <Box>
              <Button
                size="small"
                startIcon={<AddIcon />}
                onClick={() => setRows((rs) => [...rs, blankRow()])}
              >
                Add row
              </Button>
            </Box>
          </Stack>

          {error && <Alert severity="error">{error}</Alert>}
          {done && <Alert severity="success">{done}</Alert>}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={() => {
            reset();
            onClose();
          }}
        >
          {done ? "Close" : "Cancel"}
        </Button>
        <Button disabled={saving} variant="contained" onClick={submit}>
          {isAdmin ? "Add credits" : "Send for review"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default SuggestCreditsDialog;
