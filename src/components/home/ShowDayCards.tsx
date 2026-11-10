import { Box, Button, Link, Rating, Stack, TextField, Typography } from "@mui/material";
import moment from "moment";
import { useEffect, useState } from "react";

import type { CallSheet, MorningAfter } from "../../data/callSheet";
import { formatRating } from "../../utils/ratings";
import { THEATRE_TZ } from "../../utils/schedule";
import { showPath } from "../../utils/slug";
import UserAvatar from "../users/UserAvatar";

interface Props {
  tonight: CallSheet | null;
  morningAfter: MorningAfter | null;
}

const eyebrowSx = {
  fontFamily: '"DM Sans", sans-serif',
  fontSize: "0.62rem",
  letterSpacing: "0.22em",
  textTransform: "uppercase",
  color: "#D4AF55",
} as const;

const cardSx = {
  flex: "1 1 320px",
  minWidth: 0,
  p: 2.5,
  border: "1px solid rgba(212,175,85,0.3)",
  borderRadius: 1,
  background: "rgba(212,175,85,0.03)",
  display: "flex",
  flexDirection: "column",
  gap: 1.5,
} as const;

const titleSx = {
  fontFamily: '"Cormorant Garamond", serif',
  fontSize: "1.8rem",
  fontWeight: 600,
  lineHeight: 1.05,
  color: "#E8DCC8",
} as const;

const labelSx = { color: "rgba(232,220,200,0.55)", fontSize: "0.85rem" };
const valueSx = { fontSize: "0.9rem", color: "#E8DCC8" };

function timeOnly(value: Date | string) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: THEATRE_TZ,
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <Box sx={{ display: "grid", gridTemplateColumns: "96px minmax(0, 1fr)", gap: 1.5 }}>
      <Typography sx={labelSx}>{label}</Typography>
      <Box sx={valueSx}>{children}</Box>
    </Box>
  );
}

function Tonight({ sheet }: { sheet: CallSheet }) {
  const segment = sheet.type === "MUSICAL" ? "musicals" : "plays";
  const address = sheet.theatre?.address;
  const last = sheet.history.last;
  return (
    <Box aria-label="Tonight" component="section" sx={cardSx}>
      <Typography component="h2" sx={eyebrowSx}>
        Tonight
      </Typography>
      <Typography sx={titleSx}>{sheet.title}</Typography>
      {sheet.curtain && <Row label="Curtain">{timeOnly(sheet.curtain)}</Row>}
      {sheet.outBy && (
        <Row label="Out by">
          about {timeOnly(sheet.outBy)}
          {sheet.usedDefaultDuration && (
            <Typography component="span" sx={{ ...labelSx, ml: 0.5 }}>
              (running time unknown; assumes 2½ hours)
            </Typography>
          )}
        </Row>
      )}
      {sheet.theatre && (
        <Row label="Where">
          {sheet.theatre.name}
          {address && (
            <>
              <br />
              <Link
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                  `${sheet.theatre.name}, ${address}`
                )}`}
                rel="noopener noreferrer"
                sx={{ color: "#D4AF55" }}
                target="_blank"
                underline="hover"
              >
                {address} · Open in Maps
              </Link>
            </>
          )}
        </Row>
      )}
      {sheet.coming.length > 0 && (
        <Row label="Coming">
          <Stack alignItems="center" direction="row" flexWrap="wrap" sx={{ gap: 0.75 }}>
            {sheet.coming.map((f) => (
              <Link
                key={f.username}
                href={`/users/${f.username}`}
                sx={{ display: "inline-flex", alignItems: "center", gap: 0.5, color: "inherit" }}
                underline="hover"
              >
                <UserAvatar avatarSize="22px" name={f.username} />
                {f.username}
              </Link>
            ))}
          </Stack>
        </Row>
      )}
      <Row label="You and it">
        {sheet.history.visits === 0
          ? `Your first ${sheet.title}.`
          : `Visit ${sheet.history.visits + 1}.${
              last
                ? ` Last time: ${last.theatre ?? "a theatre"}, ${moment.utc(last.day).format("MMM YYYY")}${
                    last.rating != null ? `, ★ ${formatRating(last.rating)}` : ""
                  }.`
                : ""
            }`}
      </Row>
      {!sheet.curtain && (
        <Typography sx={{ ...labelSx, fontSize: "0.78rem" }}>
          Pick the performance on your log to see curtain and end times here.
        </Typography>
      )}
      <Box>
        <Button href={showPath(segment, sheet.title)} size="small" variant="outlined">
          Show page
        </Button>
      </Box>
    </Box>
  );
}

const DISMISS_KEY = "stagekeeper:morning-after-dismissed";

function readDismissed(): number[] {
  try {
    return JSON.parse(localStorage.getItem(DISMISS_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function Morning({ card }: { card: MorningAfter }) {
  const [hidden, setHidden] = useState(false);
  const [rating, setRating] = useState<number | null>(null);
  const [comment, setComment] = useState("");
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (readDismissed().includes(card.attendanceId)) setHidden(true);
  }, [card.attendanceId]);

  if (hidden) return null;

  function later() {
    try {
      localStorage.setItem(
        DISMISS_KEY,
        JSON.stringify([...readDismissed(), card.attendanceId].slice(-20))
      );
    } catch {
      // Storage can be unavailable; hiding for this visit is enough.
    }
    setHidden(true);
  }

  async function save() {
    if (rating == null && !comment.trim()) {
      setError("Add stars or a line first.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      // The going date has passed, so the API turns the row into a viewing as it saves.
      const res = await fetch("/api/shows/attendance", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attendanceId: card.attendanceId, rating, comment }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error ?? "Couldn't save.");
      setSaved(true);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Box aria-label="Last night" component="section" sx={cardSx}>
      <Typography component="h2" sx={eyebrowSx}>
        Last night
      </Typography>
      <Typography sx={{ ...titleSx, fontSize: "1.5rem" }}>How was {card.title}?</Typography>
      <Typography sx={labelSx}>
        {card.theatre ? `${card.theatre} · ` : ""}
        {moment.utc(card.day).format("ddd, MMM D")}
      </Typography>
      {saved ? (
        <Typography sx={valueSx}>Saved to your log.</Typography>
      ) : (
        <>
          <Rating
            aria-label="Your rating"
            precision={0.5}
            sx={{ "& .MuiRating-iconFilled": { color: "#D4AF55" } }}
            value={rating}
            onChange={(_, v) => {
              setRating(v);
              setError(null);
            }}
          />
          <TextField
            multiline
            label="One line, if you like"
            minRows={2}
            size="small"
            slotProps={{ htmlInput: { maxLength: 500 } }}
            value={comment}
            onChange={(e) => {
              setComment(e.target.value);
              setError(null);
            }}
          />
          {error && <Typography sx={{ color: "#E57373", fontSize: "0.8rem" }}>{error}</Typography>}
          <Stack direction="row" justifyContent="flex-end" spacing={1}>
            <Button size="small" sx={{ color: "rgba(232,220,200,0.6)" }} onClick={later}>
              Later
            </Button>
            <Button disabled={busy} size="small" variant="contained" onClick={save}>
              Save
            </Button>
          </Stack>
        </>
      )}
    </Box>
  );
}

/** The day-of and day-after cards at the top of the signed-in home page. */
export default function ShowDayCards({ tonight, morningAfter }: Props) {
  if (!tonight && !morningAfter) return null;
  return (
    <Stack direction="row" flexWrap="wrap" sx={{ gap: 2, mb: 5 }}>
      {tonight && <Tonight sheet={tonight} />}
      {morningAfter && <Morning card={morningAfter} />}
    </Stack>
  );
}
