import {
  Autocomplete,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";

import type { Visit } from "./YourVisits";

interface Candidate {
  id: number;
  username: string;
}

const mutedSx = { fontSize: "0.78rem", color: "rgba(232,220,200,0.55)" };

/** "with dana, rio" under a visit, plus tagging who came. */
export default function WhoCame({ visit, onChanged }: { visit: Visit; onChanged: () => void }) {
  const [open, setOpen] = useState(false);
  const accepted = (visit.companions ?? []).filter((c) => c.status === "ACCEPTED");
  const pending = (visit.companions ?? []).filter((c) => c.status === "PENDING");
  const taggers = (visit.joinedFrom ?? []).map((j) => j.tagger.username);
  const names = [...accepted.map((c) => c.users.username), ...taggers];

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap", mt: 0.25 }}>
      {names.length > 0 && (
        <Typography sx={{ fontSize: "0.8rem", color: "#D4AF55" }}>
          with {names.join(", ")}
        </Typography>
      )}
      {pending.length > 0 && (
        <Typography sx={mutedSx}>
          {pending.map((c) => c.users.username).join(", ")} invited
        </Typography>
      )}
      <Button
        size="small"
        sx={{ minWidth: 0, p: 0, fontSize: "0.72rem", color: "rgba(212,175,85,0.75)" }}
        onClick={() => setOpen(true)}
      >
        {names.length + pending.length > 0 ? "Edit who came" : "Who came?"}
      </Button>
      {open && (
        <TagDialog
          visit={visit}
          onClose={() => {
            setOpen(false);
            onChanged();
          }}
        />
      )}
    </Box>
  );
}

function TagDialog({ visit, onClose }: { visit: Visit; onClose: () => void }) {
  const [candidates, setCandidates] = useState<Candidate[] | null>(null);
  const [picked, setPicked] = useState<Candidate | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [tags, setTags] = useState(visit.companions ?? []);

  useEffect(() => {
    fetch("/api/user/companions?candidates=1")
      .then((r) => r.json())
      .then((d) => setCandidates(d.candidates ?? []))
      .catch(() => setCandidates([]));
  }, []);

  const taken = new Set(tags.map((t) => t.users.username.toLowerCase()));
  const options = (candidates ?? []).filter((c) => !taken.has(c.username.toLowerCase()));

  async function add() {
    if (!picked) {
      setError("Pick someone first.");
      return;
    }
    const res = await fetch("/api/user/companions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ attendanceId: visit.id, username: picked.username }),
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(body.error ?? "Couldn't tag them.");
      return;
    }
    setTags((t) => [
      ...t,
      { id: -picked.id, status: "PENDING", users: { username: picked.username } },
    ]);
    setNotice(body.message ?? null);
    setPicked(null);
  }

  async function remove(id: number, username: string) {
    if (id < 0) return;
    const res = await fetch("/api/user/companions", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (res.ok) setTags((t) => t.filter((x) => x.users.username !== username));
  }

  return (
    <Dialog fullWidth open maxWidth="xs" onClose={onClose}>
      <DialogTitle>Who came with you?</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          {tags.length > 0 && (
            <Stack direction="row" flexWrap="wrap" sx={{ gap: 1 }}>
              {tags.map((t) => (
                <Chip
                  key={t.users.username}
                  label={`${t.users.username}${t.status === "PENDING" ? " · invited" : ""}`}
                  onDelete={t.id > 0 ? () => remove(t.id, t.users.username) : undefined}
                />
              ))}
            </Stack>
          )}
          {candidates !== null && candidates.length === 0 ? (
            <Typography sx={mutedSx}>
              You can tag mutual follows and groupmates. Follow each other, or share a group, to tag
              someone.
            </Typography>
          ) : (
            <Autocomplete
              getOptionLabel={(o) => o.username}
              loading={candidates === null}
              options={options}
              renderInput={(params) => <TextField {...params} label="Name" size="small" />}
              value={picked}
              onChange={(_, v) => {
                setPicked(v);
                setError(null);
              }}
            />
          )}
          {error && <Typography sx={{ color: "#E57373", fontSize: "0.8rem" }}>{error}</Typography>}
          {notice && <Typography sx={mutedSx}>{notice}</Typography>}
          <Typography sx={mutedSx}>
            They get an invitation to add this visit to their own log. Nothing shows until they
            accept.
          </Typography>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Done</Button>
        <Button variant="contained" onClick={add}>
          Tag
        </Button>
      </DialogActions>
    </Dialog>
  );
}
