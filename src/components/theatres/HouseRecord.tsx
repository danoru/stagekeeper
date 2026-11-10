import {
  Box,
  Button,
  Chip,
  Container,
  Link,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import moment from "moment";
import { useSession } from "next-auth/react";
import { useCallback, useEffect, useState } from "react";

import {
  MAX_NOTE_LENGTH,
  MIN_RATERS,
  NOTE_CATEGORIES,
  type HouseNote,
  type HouseRecord as Record,
  type ViewerHouse,
} from "../../data/houseRecord";
import { formatRating } from "../../utils/ratings";
import { showPath } from "../../utils/slug";
import ReportButton from "../shows/ReportButton";

interface Props {
  theatreId: number;
  record: Record;
  notes: HouseNote[];
}

const eyebrowSx = {
  fontFamily: '"DM Sans", sans-serif',
  fontSize: "0.62rem",
  letterSpacing: "0.22em",
  textTransform: "uppercase",
  color: "#D4AF55",
  whiteSpace: "nowrap",
} as const;

const statSx = {
  flex: "1 1 200px",
  p: 2,
  borderRadius: 1,
  background: "rgba(212,175,85,0.04)",
  border: "1px solid rgba(212,175,85,0.1)",
} as const;

const statValueSx = {
  fontFamily: '"Cormorant Garamond", serif',
  fontSize: "1.6rem",
  fontWeight: 600,
  color: "#E8DCC8",
  lineHeight: 1.2,
} as const;

const mutedSx = { color: "rgba(232,220,200,0.55)", fontSize: "0.8rem" };

function SectionHead({ label, aside }: { label: string; aside?: string }) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 2, mt: 5, mb: 2 }}>
      <Typography component="h2" sx={eyebrowSx}>
        {label}
      </Typography>
      <Box sx={{ flex: 1, height: "1px", background: "rgba(212,175,85,0.2)" }} />
      {aside && <Typography sx={mutedSx}>{aside}</Typography>}
    </Box>
  );
}

const SHOWN = 8;

/** A theatre's history, the people credited there most, and members' tips. */
export default function HouseRecord({ theatreId, record, notes }: Props) {
  const { status } = useSession();
  const [me, setMe] = useState<ViewerHouse | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [voted, setVoted] = useState<Set<number>>(new Set());
  const [helpful, setHelpful] = useState(() => new Map(notes.map((n) => [n.id, n.helpful])));
  const [adding, setAdding] = useState(false);
  const [category, setCategory] = useState<string>(NOTE_CATEGORIES[0]);
  const [text, setText] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadMe = useCallback(() => {
    fetch(`/api/theatres/${theatreId}/me`)
      .then((r) => (r.ok ? r.json() : { house: null }))
      .then((d: { house: ViewerHouse | null }) => {
        setMe(d.house);
        setVoted(new Set(d.house?.votedNoteIds ?? []));
      })
      .catch(() => setMe(null));
  }, [theatreId]);

  useEffect(() => {
    if (status === "authenticated") loadMe();
  }, [status, loadMe]);

  async function toggleVote(noteId: number) {
    const on = !voted.has(noteId);
    const res = await fetch("/api/theatres/notes", {
      method: on ? "PUT" : "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ noteId }),
    });
    if (!res.ok) return;
    setVoted((s) => {
      const next = new Set(s);
      if (on) next.add(noteId);
      else next.delete(noteId);
      return next;
    });
    setHelpful((m) => new Map(m).set(noteId, (m.get(noteId) ?? 0) + (on ? 1 : -1)));
  }

  async function submitNote() {
    setError(null);
    const trimmed = text.trim();
    if (trimmed.length < 10) {
      setError("Write at least a short sentence.");
      return;
    }
    const res = await fetch("/api/theatres/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ theatreId, category, text: trimmed }),
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(body.error ?? "Couldn't save your tip.");
      return;
    }
    setText("");
    setAdding(false);
    setMessage(
      body.note?.status === "APPROVED"
        ? "Added. Reload to see it."
        : "Thanks. An admin will check it before it appears."
    );
    loadMe();
  }

  const seen = new Set(me?.seenRunIds ?? []);
  const shown = expanded ? record.productions : record.productions.slice(0, SHOWN);

  return (
    <Container maxWidth="lg" sx={{ px: { xs: 2, md: 3 }, pb: 2 }}>
      <SectionHead aside={`averages from ${MIN_RATERS}+ raters`} label="The house record" />
      <Stack direction="row" flexWrap="wrap" sx={{ gap: 1.5, mb: 2 }}>
        {me && (
          <Box sx={statSx}>
            <Typography sx={eyebrowSx}>Your nights here</Typography>
            <Typography sx={statValueSx}>{me.nights}</Typography>
            <Typography sx={mutedSx}>
              {me.since ? `since ${moment.utc(me.since).format("YYYY")}` : "dates not logged"}
              {me.average != null && ` · your average ★ ${formatRating(me.average)}`}
            </Typography>
          </Box>
        )}
        <Box sx={statSx}>
          <Typography sx={eyebrowSx}>Productions on record</Typography>
          <Typography sx={statValueSx}>{record.productions.length}</Typography>
          <Typography sx={mutedSx}>as far as StageKeeper knows</Typography>
        </Box>
        <Box sx={statSx}>
          <Typography sx={eyebrowSx}>Best loved here</Typography>
          {record.bestLoved ? (
            <>
              <Typography sx={{ ...statValueSx, fontSize: "1.3rem" }}>
                {record.bestLoved.title}
              </Typography>
              <Typography sx={mutedSx}>
                ★ {formatRating(record.bestLoved.average!)} ·{" "}
                {moment.utc(record.bestLoved.startDate).format("YYYY")}
              </Typography>
            </>
          ) : (
            <Typography sx={{ ...mutedSx, mt: 0.5 }}>
              Shows once a production has {MIN_RATERS} raters.
            </Typography>
          )}
        </Box>
      </Stack>

      {record.productions.length > 0 && (
        <Box component="ul" sx={{ listStyle: "none", m: 0, p: 0 }}>
          {shown.map((p) => (
            <Box
              key={p.id}
              component="li"
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr auto", sm: "110px minmax(0, 1fr) 160px 120px" },
                gap: 1,
                alignItems: "center",
                py: 1,
                borderBottom: "1px solid rgba(212,175,85,0.08)",
                fontSize: "0.9rem",
              }}
            >
              <Typography sx={{ ...mutedSx, display: { xs: "none", sm: "block" } }}>
                {p.season ?? moment.utc(p.startDate).format("YYYY")}
              </Typography>
              <Link
                href={showPath(p.type === "MUSICAL" ? "musicals" : "plays", p.title)}
                sx={{ color: "rgba(232,220,200,0.95)" }}
                underline="hover"
              >
                {p.title}
              </Link>
              <Typography sx={{ ...mutedSx, display: { xs: "none", sm: "block" } }}>
                {p.running
                  ? "running now"
                  : p.average != null
                    ? `★ ${formatRating(p.average)} · ${p.seenBy} seen`
                    : p.seenBy > 0
                      ? `${p.seenBy} seen`
                      : "—"}
              </Typography>
              <Typography sx={{ fontSize: "0.8rem", color: "#7BC97B", textAlign: "right" }}>
                {seen.has(p.id) ? "You saw this" : ""}
              </Typography>
            </Box>
          ))}
        </Box>
      )}
      {record.productions.length > SHOWN && (
        <Button size="small" sx={{ mt: 1 }} onClick={() => setExpanded((v) => !v)}>
          {expanded ? "Show fewer" : `Show all ${record.productions.length}`}
        </Button>
      )}

      {record.people.length > 0 && (
        <>
          <SectionHead label="Credited here most" />
          <Typography sx={{ lineHeight: 1.9 }}>
            {record.people.map((p, i) => (
              <span key={p.slug}>
                {i > 0 && " · "}
                <Link
                  href={`/people/${p.slug}`}
                  sx={{ color: "rgba(232,220,200,0.95)" }}
                  underline="hover"
                >
                  {p.name}
                </Link>
                {p.productions > 1 && (
                  <Typography component="span" sx={mutedSx}>
                    {` (${p.productions})`}
                  </Typography>
                )}
              </span>
            ))}
          </Typography>
        </>
      )}

      <SectionHead label="Know before you go" />
      {notes.length === 0 && (
        <Typography sx={{ ...mutedSx, fontSize: "0.9rem" }}>
          No tips yet. Members who've been here can add parking, seats and other advice.
        </Typography>
      )}
      <Stack spacing={1}>
        {notes.map((n) => (
          <Box
            key={n.id}
            sx={{
              display: "flex",
              gap: 1.5,
              alignItems: "flex-start",
              p: 1.5,
              border: "1px solid rgba(212,175,85,0.14)",
              borderRadius: 1,
            }}
          >
            <Chip label={n.category} size="small" sx={{ color: "#D4AF55" }} variant="outlined" />
            <Typography sx={{ flex: 1, fontSize: "0.9rem", lineHeight: 1.5 }}>{n.text}</Typography>
            <Stack alignItems="flex-end" spacing={0.5}>
              <Typography sx={{ ...mutedSx, whiteSpace: "nowrap" }}>
                {helpful.get(n.id) ?? 0} found this helpful · {moment(n.createdAt).format("YYYY")}
              </Typography>
              {status === "authenticated" && (
                <Button
                  aria-pressed={voted.has(n.id)}
                  size="small"
                  sx={{ minWidth: 0, p: 0, fontSize: "0.72rem" }}
                  onClick={() => toggleVote(n.id)}
                >
                  {voted.has(n.id) ? "Helpful ✓" : "Helpful"}
                </Button>
              )}
              <ReportButton targetId={n.id} targetType="THEATRE_NOTE" />
            </Stack>
          </Box>
        ))}
      </Stack>
      {message && <Typography sx={{ ...mutedSx, mt: 1.5 }}>{message}</Typography>}
      {me?.canAddNote && !adding && (
        <Button size="small" sx={{ mt: 1.5 }} variant="outlined" onClick={() => setAdding(true)}>
          Add a tip
        </Button>
      )}
      {me && !me.canAddNote && (
        <Typography sx={{ ...mutedSx, mt: 1.5 }}>Log a visit here to add a tip.</Typography>
      )}
      {adding && (
        <Stack spacing={1.5} sx={{ mt: 2, maxWidth: 640 }}>
          <TextField
            select
            label="About"
            size="small"
            sx={{ maxWidth: 220 }}
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {NOTE_CATEGORIES.map((c) => (
              <MenuItem key={c} value={c}>
                {c}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            multiline
            helperText={`${text.length}/${MAX_NOTE_LENGTH} · an admin checks tips before they appear`}
            label="Your tip"
            minRows={2}
            size="small"
            slotProps={{ htmlInput: { maxLength: MAX_NOTE_LENGTH } }}
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              setError(null);
            }}
          />
          {error && <Typography sx={{ color: "#E57373", fontSize: "0.8rem" }}>{error}</Typography>}
          <Stack direction="row" spacing={1}>
            <Button size="small" variant="contained" onClick={submitNote}>
              Submit
            </Button>
            <Button size="small" onClick={() => setAdding(false)}>
              Cancel
            </Button>
          </Stack>
        </Stack>
      )}
    </Container>
  );
}
