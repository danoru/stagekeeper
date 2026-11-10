import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  Paper,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import moment from "moment";
import Head from "next/head";
import { useCallback, useEffect, useState } from "react";

import AdminGuard from "../../src/components/admin/AdminGuard";
import { describePart } from "../../src/components/people/creditText";
import type { AdminCredit, AdminPerson, PersonPair } from "../../src/data/peopleAdmin";

interface SearchRow {
  id: number;
  name: string;
  disambiguator: string | null;
  status: string;
  _count: { credits: number };
}

function creditLine(c: AdminCredit) {
  const p = c.programmings;
  const show = p.musicals?.title ?? p.plays?.title ?? "Unknown show";
  const theatre = p.seasons?.theatres.name ?? "Theatre TBD";
  return `${show} · ${describePart(c)} · ${theatre} ${moment.utc(p.startDate).format("YYYY")}`;
}

function personLabel(p: { name: string; disambiguator: string | null }) {
  return p.disambiguator ? `${p.name} · ${p.disambiguator}` : p.name;
}

async function send(method: "POST" | "PATCH", body: unknown) {
  const res = await fetch("/api/admin/people", {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error ?? "Failed.");
  return data;
}

function PersonColumn({ person }: { person: AdminPerson }) {
  return (
    <Paper sx={{ p: 2, flex: 1, minWidth: 0 }} variant="outlined">
      <Typography variant="h6">{personLabel(person)}</Typography>
      <Typography color="text.secondary" variant="body2">
        {person.credits.length} credit{person.credits.length === 1 ? "" : "s"} · added{" "}
        {moment(person.createdAt).format("YYYY-MM-DD")}
        {person.status === "PENDING" ? " · pending" : ""}
      </Typography>
      <Box component="ul" sx={{ m: 0, mt: 1, pl: 2.5 }}>
        {person.credits.map((c) => (
          <Typography key={c.id} component="li" variant="body2">
            {creditLine(c)}
          </Typography>
        ))}
      </Box>
    </Paper>
  );
}

function PersonEditor({
  personId,
  onChanged,
  onError,
}: {
  personId: number;
  onChanged: (message: string) => void;
  onError: (message: string) => void;
}) {
  const [person, setPerson] = useState<AdminPerson | null>(null);
  const [name, setName] = useState("");
  const [disambiguator, setDisambiguator] = useState("");
  const [picked, setPicked] = useState<Set<number>>(new Set());
  const [newName, setNewName] = useState("");
  const [newDisambiguator, setNewDisambiguator] = useState("");
  const [mergeQuery, setMergeQuery] = useState("");
  const [mergeOptions, setMergeOptions] = useState<SearchRow[]>([]);

  const load = useCallback(async () => {
    const res = await fetch(`/api/admin/people?id=${personId}`);
    const data = await res.json();
    if (!res.ok) return onError(data.error ?? "Couldn't load that person.");
    setPerson(data.person);
    setName(data.person.name);
    setDisambiguator(data.person.disambiguator ?? "");
    setNewName(data.person.name);
    setPicked(new Set());
  }, [personId, onError]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const q = mergeQuery.trim();
    if (q.length < 2) return setMergeOptions([]);
    const t = setTimeout(() => {
      fetch(`/api/admin/people?q=${encodeURIComponent(q)}`)
        .then((r) => r.json())
        .then((d) => setMergeOptions((d.people ?? []).filter((p: SearchRow) => p.id !== personId)));
    }, 200);
    return () => clearTimeout(t);
  }, [mergeQuery, personId]);

  if (!person) return <CircularProgress size={24} />;

  async function saveNaming() {
    try {
      await send("PATCH", { id: personId, name, disambiguator });
      onChanged("Saved.");
      load();
    } catch (e) {
      onError((e as Error).message);
    }
  }

  async function split() {
    try {
      const data = await send("POST", {
        action: "split",
        personId,
        creditIds: [...picked],
        name: newName,
        disambiguator: newDisambiguator,
      });
      onChanged(
        `Moved ${picked.size} credit${picked.size === 1 ? "" : "s"} to /people/${data.person.slug}.`
      );
      load();
    } catch (e) {
      onError((e as Error).message);
    }
  }

  async function mergeInto(target: SearchRow) {
    if (!window.confirm(`Merge ${person!.name} into ${personLabel(target)}? This can't be undone.`))
      return;
    try {
      const data = await send("POST", { action: "merge", fromId: personId, intoId: target.id });
      onChanged(
        `Merged: ${data.moved} moved, ${data.dropped} duplicate${data.dropped === 1 ? "" : "s"} dropped.`
      );
    } catch (e) {
      onError((e as Error).message);
    }
  }

  return (
    <Stack spacing={2}>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
        <TextField
          label="Name"
          size="small"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <TextField
          helperText="Tells apart people with the same name"
          label="Disambiguator"
          placeholder="San Diego"
          size="small"
          value={disambiguator}
          onChange={(e) => setDisambiguator(e.target.value)}
        />
        <Button sx={{ alignSelf: "flex-start" }} variant="outlined" onClick={saveNaming}>
          Save
        </Button>
      </Stack>

      <Box>
        <Typography gutterBottom variant="subtitle2">
          Credits ({person.credits.length}) — tick the ones that belong to someone else to split
          them
        </Typography>
        {person.credits.map((c) => (
          <Stack key={c.id} alignItems="center" direction="row">
            <Checkbox
              checked={picked.has(c.id)}
              inputProps={{ "aria-label": `Move ${creditLine(c)}` }}
              size="small"
              onChange={(e) =>
                setPicked((s) => {
                  const next = new Set(s);
                  if (e.target.checked) next.add(c.id);
                  else next.delete(c.id);
                  return next;
                })
              }
            />
            <Typography variant="body2">{creditLine(c)}</Typography>
            {c.status === "PENDING" && <Chip label="pending" size="small" sx={{ ml: 1 }} />}
          </Stack>
        ))}
      </Box>

      {picked.size > 0 && (
        <Paper sx={{ p: 2 }} variant="outlined">
          <Typography gutterBottom variant="subtitle2">
            Split {picked.size} credit{picked.size === 1 ? "" : "s"} into a new person
          </Typography>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
            <TextField
              label="Name"
              size="small"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
            <TextField
              label="Disambiguator"
              placeholder="Fresno"
              size="small"
              value={newDisambiguator}
              onChange={(e) => setNewDisambiguator(e.target.value)}
            />
            <Button variant="contained" onClick={split}>
              Split
            </Button>
          </Stack>
        </Paper>
      )}

      <Box>
        <Typography gutterBottom variant="subtitle2">
          Merge {person.name} into someone else
        </Typography>
        <TextField
          label="Find the person to keep"
          size="small"
          value={mergeQuery}
          onChange={(e) => setMergeQuery(e.target.value)}
        />
        <Stack spacing={0.5} sx={{ mt: 1 }}>
          {mergeOptions.map((p) => (
            <Stack key={p.id} alignItems="center" direction="row" spacing={1}>
              <Typography variant="body2">
                {personLabel(p)} · {p._count.credits} credit{p._count.credits === 1 ? "" : "s"}
              </Typography>
              <Button size="small" onClick={() => mergeInto(p)}>
                Merge into
              </Button>
            </Stack>
          ))}
        </Stack>
      </Box>
    </Stack>
  );
}

export default function AdminPeoplePage() {
  const [pairs, setPairs] = useState<PersonPair[] | null>(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchRow[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [toast, setToast] = useState<{ message: string; severity: "success" | "error" } | null>(
    null
  );

  const loadPairs = useCallback(async () => {
    const res = await fetch("/api/admin/people?suggestions=1");
    const data = await res.json();
    setPairs(data.pairs ?? []);
  }, []);

  useEffect(() => {
    loadPairs();
  }, [loadPairs]);

  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) return setResults([]);
    const t = setTimeout(() => {
      fetch(`/api/admin/people?q=${encodeURIComponent(q)}`)
        .then((r) => r.json())
        .then((d) => setResults(d.people ?? []));
    }, 200);
    return () => clearTimeout(t);
  }, [query]);

  const onChanged = useCallback(
    (message: string) => {
      setToast({ message, severity: "success" });
      loadPairs();
    },
    [loadPairs]
  );
  const onError = useCallback((message: string) => setToast({ message, severity: "error" }), []);

  async function merge(pair: PersonPair) {
    try {
      const data = await send("POST", { action: "merge", fromId: pair.b.id, intoId: pair.a.id });
      onChanged(
        `Merged into ${pair.a.name}: ${data.moved} moved, ${data.dropped} duplicate${data.dropped === 1 ? "" : "s"} dropped.`
      );
    } catch (e) {
      onError((e as Error).message);
    }
  }

  return (
    <AdminGuard>
      <Head>
        <title>People • Admin • StageKeeper</title>
      </Head>
      <Box sx={{ maxWidth: 1100, mx: "auto", p: { xs: 2, md: 4 } }}>
        <Typography gutterBottom variant="h4">
          People
        </Typography>

        <Typography gutterBottom sx={{ mt: 2 }} variant="h6">
          Same person?
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 2 }} variant="body2">
          The same name once punctuation and accents are ignored, or names a letter or two apart
          that share a theatre. To mark two people as different, give them different disambiguators
          below.
        </Typography>
        {pairs === null ? (
          <CircularProgress size={24} />
        ) : pairs.length === 0 ? (
          <Typography color="text.secondary">No suggestions right now.</Typography>
        ) : (
          <Stack spacing={3}>
            {pairs.map((pair) => (
              <Box key={`${pair.a.id}-${pair.b.id}`}>
                <Typography color="text.secondary" sx={{ mb: 1 }} variant="body2">
                  {pair.reason}
                </Typography>
                <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                  <PersonColumn person={pair.a} />
                  <PersonColumn person={pair.b} />
                </Stack>
                <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                  <Button variant="contained" onClick={() => merge(pair)}>
                    Merge into {pair.a.name}
                  </Button>
                  <Button onClick={() => setSelected(pair.b.id)}>Split or rename instead…</Button>
                </Stack>
              </Box>
            ))}
          </Stack>
        )}

        <Typography gutterBottom sx={{ mt: 5 }} variant="h6">
          Find a person
        </Typography>
        <TextField
          label="Name"
          size="small"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <Stack direction="row" flexWrap="wrap" sx={{ mt: 1, gap: 1 }}>
          {results.map((p) => (
            <Chip
              key={p.id}
              color={selected === p.id ? "primary" : "default"}
              label={`${personLabel(p)} · ${p._count.credits}`}
              onClick={() => setSelected(p.id)}
            />
          ))}
        </Stack>
        {selected != null && (
          <Paper sx={{ p: 3, mt: 2 }}>
            <PersonEditor
              key={selected}
              personId={selected}
              onChanged={(m) => {
                onChanged(m);
                if (m.startsWith("Merged")) setSelected(null);
              }}
              onError={onError}
            />
          </Paper>
        )}
      </Box>
      <Snackbar autoHideDuration={5000} open={toast !== null} onClose={() => setToast(null)}>
        {toast ? (
          <Alert severity={toast.severity} onClose={() => setToast(null)}>
            {toast.message}
          </Alert>
        ) : undefined}
      </Snackbar>
    </AdminGuard>
  );
}
