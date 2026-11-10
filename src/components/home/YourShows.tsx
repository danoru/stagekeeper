import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Link,
  Rating,
  TextField,
  Typography,
} from "@mui/material";
import moment from "moment";
import { useEffect, useState } from "react";

import type { CallSheet, MorningAfter } from "../../data/callSheet";
import type { CompanionInvite } from "../../data/companions";
import type { NormalizedAttendance } from "../../data/performances";
import { resolveShowImage } from "../../utils/gradients";
import { formatRating } from "../../utils/ratings";
import { THEATRE_TZ } from "../../utils/schedule";
import { showPath } from "../../utils/slug";
import UserAvatar from "../users/UserAvatar";

// The top of the signed-in home page as one timeline: last night (rate it), tonight (when,
// where, who's coming), then what's next, with "Were you there?" invitations as rows below.

interface Props {
  tonight: CallSheet | null;
  morningAfter: MorningAfter | null;
  /** The viewer's going dates from today on, tonight's excluded. */
  upcoming: NormalizedAttendance[];
  sessionUser: string;
}

const MAX_NEXT = 4;
const DISMISS_KEY = "stagekeeper:morning-after-dismissed";

const eyebrowSx = {
  fontFamily: '"DM Sans", sans-serif',
  fontSize: "0.62rem",
  fontWeight: 500,
  letterSpacing: "0.22em",
  textTransform: "uppercase",
  color: "#D4AF55",
  whiteSpace: "nowrap",
  m: 0,
} as const;

const whenSx = {
  fontFamily: '"DM Sans", sans-serif',
  fontSize: { xs: "0.6rem", sm: "0.62rem" },
  letterSpacing: { xs: "0.16em", sm: "0.18em" },
  textTransform: "uppercase",
  color: "rgba(232,220,200,0.62)",
  mb: 1,
  whiteSpace: "nowrap",
} as const;

const mutedSx = { color: "rgba(232,220,200,0.62)" };

const visuallyHidden = {
  position: "absolute",
  width: 1,
  height: 1,
  overflow: "hidden",
  clip: "rect(0 0 0 0)",
  whiteSpace: "nowrap",
} as const;

// Phone posters are smaller so the next card peeks in from the right.
const POSTER = { width: { xs: 150, sm: 211 }, height: { xs: 220, sm: 270 } };

const ORDINALS = ["first", "second", "third", "fourth", "fifth", "sixth", "seventh", "eighth"];

function timeOnly(value: Date | string) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: THEATRE_TZ,
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

// Going dates are calendar days stored at UTC midnight.
function dayLabel(value: Date | string) {
  const m = moment.utc(value);
  return m.format(m.year() === moment().year() ? "ddd, MMM D" : "ddd, MMM D, YYYY");
}

function segmentOf(type: string) {
  return type === "MUSICAL" ? "musicals" : "plays";
}

function readDismissed(): number[] {
  try {
    return JSON.parse(localStorage.getItem(DISMISS_KEY) ?? "[]");
  } catch {
    return [];
  }
}

/** The poster face the site's cards use: image or gradient, gold top line, inner border. */
function PosterFace({
  playbill,
  title,
  dim = 0.55,
}: {
  playbill: string;
  title: string;
  dim?: number;
}) {
  const { isGradient, value } = resolveShowImage(playbill, title);
  return (
    <>
      <Box
        aria-hidden
        className="poster-image"
        sx={{
          position: "absolute",
          inset: 0,
          background: isGradient ? value : `center / cover no-repeat url("${value}")`,
          filter: isGradient ? "none" : `brightness(${dim})`,
          transition: "filter 0.3s",
        }}
      />
      <Box
        aria-hidden
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "2px",
          background: "linear-gradient(90deg, transparent, rgba(212,175,85,0.5), transparent)",
        }}
      />
      <Box
        aria-hidden
        className="poster-inner"
        sx={{
          position: "absolute",
          inset: { xs: "5px", sm: "6px" },
          border: "1px solid rgba(212,175,85,0.2)",
          transition: "border-color 0.3s",
          pointerEvents: "none",
        }}
      />
    </>
  );
}

const captionSx = {
  position: "absolute",
  left: 0,
  right: 0,
  bottom: 0,
  p: { xs: "24px 10px 10px", sm: "28px 12px 12px" },
  background:
    "linear-gradient(to top, rgba(8,12,20,0.98) 0%, rgba(8,12,20,0.78) 62%, transparent 100%)",
} as const;

function Header({ moreHref }: { moreHref: string | null }) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: { xs: 1.75, sm: 2.5 } }}>
      <Typography component="h2" sx={eyebrowSx}>
        Your Shows
      </Typography>
      <Box aria-hidden sx={{ flex: 1, height: "1px", background: "rgba(212,175,85,0.2)" }} />
      {moreHref && (
        <Link
          href={moreHref}
          sx={{
            ...eyebrowSx,
            color: "rgba(232,220,200,0.55)",
            "&:hover": { color: "#D4AF55" },
          }}
          underline="none"
        >
          All upcoming
        </Link>
      )}
    </Box>
  );
}

function historyLine(sheet: CallSheet) {
  const n = sheet.history.visits + 1;
  if (n === 1) return { short: "Your first time", full: `Your first ${sheet.title}.` };
  const nth = n <= ORDINALS.length ? `Your ${ORDINALS[n - 1]} time` : `Visit ${n}`;
  const last = sheet.history.last;
  if (!last) return { short: nth, full: `${nth}.` };
  const when = moment.utc(last.day).format("MMM YYYY");
  const full = `${nth}. Last time: ${last.theatre ?? "a theatre"}, ${when}${
    last.rating != null ? `, ★ ${formatRating(last.rating)}` : ""
  }.`;
  const short =
    last.rating != null ? `${nth} · last ★ ${formatRating(last.rating)}` : `${nth} · last ${when}`;
  return { short, full };
}

function TonightCard({ sheet }: { sheet: CallSheet }) {
  const address = sheet.theatre?.address;
  const mapsHref =
    sheet.theatre && address
      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
          `${sheet.theatre.name}, ${address}`
        )}`
      : null;
  const history = historyLine(sheet);

  return (
    <Box
      sx={{
        display: "flex",
        width: { xs: "100%", sm: 470 },
        minHeight: { xs: 210, sm: 270 },
        border: "1px solid rgba(212,175,85,0.3)",
        borderRadius: 1,
        overflow: "hidden",
        background: "#0D1520",
      }}
    >
      <Box sx={{ position: "relative", flex: { xs: "0 0 126px", sm: "0 0 180px" } }}>
        <PosterFace dim={0.85} playbill={sheet.playbill} title={sheet.title} />
      </Box>
      <Box
        sx={{
          flex: 1,
          minWidth: 0,
          p: { xs: "14px", sm: "18px 20px" },
          display: "flex",
          flexDirection: "column",
          gap: { xs: 0.75, sm: 1 },
        }}
      >
        <Link
          href={showPath(segmentOf(sheet.type), sheet.title)}
          sx={{
            fontFamily: '"Cormorant Garamond", serif',
            fontSize: { xs: "1.75rem", sm: "2rem" },
            fontWeight: 600,
            lineHeight: 1,
            color: "#E8DCC8",
            "&:hover": { color: "#D4AF55" },
          }}
          underline="none"
        >
          {sheet.title}
        </Link>

        {sheet.curtain ? (
          <Typography sx={{ fontSize: "0.82rem", color: "#E8DCC8" }}>
            {timeOnly(sheet.curtain)}{" "}
            <Box aria-hidden component="span" sx={{ color: "rgba(232,220,200,0.55)" }}>
              →
            </Box>
            <Box component="span" sx={visuallyHidden}>
              to
            </Box>{" "}
            about {sheet.outBy ? timeOnly(sheet.outBy) : ""}
            {sheet.usedDefaultDuration && (
              <Box component="span" sx={{ ...mutedSx, fontSize: "0.72rem", ml: 0.75 }}>
                (running time unknown)
              </Box>
            )}
          </Typography>
        ) : (
          <Typography sx={{ ...mutedSx, fontSize: "0.76rem", lineHeight: 1.45 }}>
            Pick the performance on your log to see curtain and end times.
          </Typography>
        )}

        {sheet.theatre && (
          <Typography
            sx={{ ...mutedSx, fontSize: { xs: "0.75rem", sm: "0.78rem" }, lineHeight: 1.45 }}
          >
            {sheet.theatre.name}
            {mapsHref && (
              <>
                <Box component="span" sx={{ display: { xs: "inline", sm: "none" } }}>
                  {" · "}
                </Box>
                <Box component="br" sx={{ display: { xs: "none", sm: "block" } }} />
                <Link
                  href={mapsHref}
                  rel="noopener noreferrer"
                  sx={{ color: "#D4AF55" }}
                  target="_blank"
                  underline="hover"
                >
                  Open in Maps
                </Link>
              </>
            )}
          </Typography>
        )}

        {sheet.coming.length > 0 && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.25 }}>
            <Box aria-hidden sx={{ display: { xs: "none", sm: "flex" } }}>
              {sheet.coming.slice(0, 4).map((f, i) => (
                <Box
                  key={f.username}
                  sx={{
                    ml: i === 0 ? 0 : "-8px",
                    borderRadius: "50%",
                    border: "2px solid #0D1520",
                    display: "flex",
                  }}
                >
                  <UserAvatar avatarSize="24px" name={f.username} />
                </Box>
              ))}
            </Box>
            <Typography sx={{ ...mutedSx, fontSize: "0.75rem", minWidth: 0 }}>
              {sheet.coming.map((f, i) => (
                <span key={f.username}>
                  {i > 0 && ", "}
                  <Link href={`/users/${f.username}`} sx={{ color: "inherit" }} underline="hover">
                    {f.username}
                  </Link>
                </span>
              ))}{" "}
              going
            </Typography>
          </Box>
        )}

        <Typography
          sx={{
            mt: "auto",
            pt: 0.5,
            fontFamily: '"Cormorant Garamond", serif',
            fontStyle: "italic",
            fontSize: { xs: "0.875rem", sm: "0.9rem" },
            ...mutedSx,
          }}
          title={history.full}
        >
          {history.short}
        </Typography>
      </Box>
    </Box>
  );
}

function RateDialog({
  card,
  open,
  initialRating,
  onClose,
  onLater,
  onSaved,
}: {
  card: MorningAfter;
  open: boolean;
  initialRating: number | null;
  onClose: () => void;
  onLater: () => void;
  onSaved: (rating: number | null) => void;
}) {
  const [rating, setRating] = useState<number | null>(initialRating);
  const [comment, setComment] = useState(card.comment ?? "");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (open) {
      setRating(initialRating);
      setError(null);
    }
  }, [open, initialRating]);

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
        // Leaving the note empty keeps whatever was there rather than erasing it.
        body: JSON.stringify({
          attendanceId: card.attendanceId,
          rating,
          ...(comment.trim() ? { comment } : {}),
        }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error ?? "Couldn't save.");
      onSaved(rating);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog fullWidth maxWidth="xs" open={open} onClose={onClose}>
      <DialogTitle sx={{ pb: 0.5 }}>
        <Box
          component="span"
          sx={{
            display: "block",
            fontFamily: '"Cormorant Garamond", serif',
            fontSize: "1.5rem",
            fontWeight: 600,
            lineHeight: 1.1,
          }}
        >
          How was {card.title}?
        </Box>
        <Box component="span" sx={{ display: "block", fontSize: "0.8rem", mt: 0.5, ...mutedSx }}>
          {card.theatre ? `${card.theatre} · ` : ""}
          {dayLabel(card.day)}
        </Box>
      </DialogTitle>
      <DialogContent
        sx={{ display: "flex", flexDirection: "column", gap: 2, pt: "12px !important" }}
      >
        <Rating
          aria-label="Your rating"
          precision={0.5}
          size="large"
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
        {error && (
          <Typography role="alert" sx={{ color: "#E57373", fontSize: "0.8rem" }}>
            {error}
          </Typography>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button sx={{ color: "rgba(232,220,200,0.6)" }} onClick={onLater}>
          Later
        </Button>
        <Button disabled={busy} variant="contained" onClick={save}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function RateCard({ card, onDismiss }: { card: MorningAfter; onDismiss: () => void }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [pickedRating, setPickedRating] = useState<number | null>(null);
  const [saved, setSaved] = useState<{ rating: number | null } | null>(null);

  function openWith(rating: number | null) {
    setPickedRating(rating);
    setDialogOpen(true);
  }

  const linkSx = {
    p: 0,
    minWidth: 0,
    font: "inherit",
    fontSize: "0.75rem",
    color: "rgba(232,220,200,0.75)",
    textTransform: "none",
    letterSpacing: 0,
    "&:hover": { color: "#D4AF55", background: "transparent" },
  } as const;

  return (
    <>
      <Box
        sx={{
          position: "relative",
          ...POSTER,
          width: { xs: 160, sm: 211 },
          border: "1px solid rgba(212,175,85,0.2)",
          borderRadius: 1,
          overflow: "hidden",
        }}
      >
        <PosterFace playbill={card.playbill} title={card.title} />
        {!saved && (
          <Box
            sx={{
              position: "absolute",
              top: { xs: 12, sm: 14 },
              left: { xs: 12, sm: 14 },
              fontSize: "0.6rem",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "#D4AF55",
              background: "rgba(8,12,20,0.85)",
              border: "1px solid rgba(212,175,85,0.35)",
              px: 1,
              py: 0.4,
              borderRadius: 2.5,
            }}
          >
            Rate it
          </Box>
        )}
        <Box sx={{ ...captionSx, pt: { xs: "30px", sm: "40px" } }}>
          <Link
            href={showPath(segmentOf(card.type), card.title)}
            sx={{
              display: "block",
              fontFamily: '"Cormorant Garamond", serif',
              fontSize: { xs: "0.95rem", sm: "1.05rem" },
              fontWeight: 600,
              lineHeight: 1.15,
              color: "#E8DCC8",
              "&:hover": { color: "#D4AF55" },
            }}
            underline="none"
          >
            <Box component="span" sx={{ display: { xs: "none", sm: "inline" } }}>
              How was{" "}
            </Box>
            {card.title}
            <Box component="span" sx={{ display: { xs: "none", sm: "inline" } }}>
              ?
            </Box>
          </Link>
          {card.theatre && (
            <Typography
              sx={{
                fontSize: { xs: "0.62rem", sm: "0.68rem" },
                color: "rgba(212,175,85,0.85)",
                mt: 0.25,
              }}
            >
              {card.theatre}
            </Typography>
          )}

          {saved ? (
            <Box sx={{ mt: 0.75 }}>
              {saved.rating != null && (
                <Rating
                  readOnly
                  precision={0.5}
                  size="small"
                  sx={{ "& .MuiRating-iconFilled": { color: "#D4AF55" } }}
                  value={saved.rating}
                />
              )}
              <Typography sx={{ fontSize: "0.75rem", color: "#E8DCC8" }}>
                Saved to your log.
              </Typography>
            </Box>
          ) : (
            <>
              {/* Desktop: tap a star to start; the dialog holds the half stars and the note. */}
              <Box sx={{ display: { xs: "none", sm: "block" }, mt: 0.75, ml: "-2px" }}>
                <Rating
                  aria-label={`Rate ${card.title}`}
                  sx={{
                    "& .MuiRating-iconEmpty": { color: "rgba(212,175,85,0.75)" },
                    "& .MuiRating-iconFilled, & .MuiRating-iconHover": { color: "#D4AF55" },
                  }}
                  value={null}
                  onChange={(_, v) => openWith(v)}
                />
                <Box
                  sx={{ display: "flex", alignItems: "center", gap: 0.75, mt: 0.25, ...mutedSx }}
                >
                  <Button disableRipple sx={linkSx} onClick={() => openWith(null)}>
                    Add a line
                  </Button>
                  <span aria-hidden>·</span>
                  <Button disableRipple sx={linkSx} onClick={onDismiss}>
                    Later
                  </Button>
                </Box>
              </Box>
              {/* Phone: one large tap target. */}
              <Button
                disableRipple
                sx={{
                  ...linkSx,
                  display: { xs: "flex", sm: "none" },
                  justifyContent: "flex-start",
                  height: 44,
                  fontSize: "0.8rem",
                  color: "#D4AF55",
                }}
                onClick={() => openWith(null)}
              >
                ★ Add your stars
              </Button>
            </>
          )}
        </Box>
      </Box>
      <RateDialog
        card={card}
        initialRating={pickedRating}
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onLater={() => {
          setDialogOpen(false);
          onDismiss();
        }}
        onSaved={(rating) => {
          setDialogOpen(false);
          setSaved({ rating });
        }}
      />
    </>
  );
}

function NextCard({ entry }: { entry: NormalizedAttendance }) {
  const perf = entry.performances;
  const show = perf.type === "MUSICAL" ? perf.musicals : perf.plays;
  if (!show) return null;
  return (
    <Link
      href={showPath(segmentOf(perf.type), show.title)}
      sx={{
        position: "relative",
        display: "block",
        ...POSTER,
        border: "1px solid rgba(212,175,85,0.1)",
        borderRadius: 1,
        overflow: "hidden",
        transition: "border-color 0.3s, transform 0.3s, box-shadow 0.3s",
        "&:hover": {
          borderColor: "rgba(212,175,85,0.35)",
          transform: "translateY(-4px)",
          boxShadow: "0 16px 40px rgba(0,0,0,0.55), 0 0 0 1px rgba(212,175,85,0.2)",
          ".poster-image": { filter: "brightness(0.75)" },
          ".poster-inner": { borderColor: "rgba(212,175,85,0.55)" },
          ".poster-title": { color: "#D4AF55" },
        },
      }}
      underline="none"
    >
      <PosterFace playbill={show.playbill} title={show.title} />
      <Box sx={captionSx}>
        <Typography
          className="poster-title"
          sx={{
            fontFamily: '"Cormorant Garamond", serif',
            fontSize: "0.95rem",
            fontWeight: 600,
            lineHeight: 1.2,
            color: "#E8DCC8",
            transition: "color 0.3s",
          }}
        >
          {show.title}
        </Typography>
        {perf.theatres.id !== 0 && (
          <Typography
            sx={{ fontSize: "0.62rem", letterSpacing: "0.06em", color: "rgba(212,175,85,0.8)" }}
          >
            {perf.theatres.name}
          </Typography>
        )}
      </Box>
    </Link>
  );
}

function InviteRow({
  invite,
  status,
  onRespond,
}: {
  invite: CompanionInvite;
  status: string | undefined;
  onRespond: (accept: boolean) => void;
}) {
  const { isGradient, value } = resolveShowImage(invite.playbill, invite.title);
  const buttonSx = {
    height: { xs: 44, sm: 36 },
    fontSize: "0.82rem",
    textTransform: "none",
  } as const;
  return (
    <Box
      aria-label="Were you there?"
      role="group"
      sx={{
        display: "flex",
        flexWrap: { xs: "wrap", sm: "nowrap" },
        alignItems: "center",
        columnGap: { xs: 1.5, sm: 2 },
        rowGap: 1,
        p: { xs: 1.5, sm: "12px 16px" },
        border: "1px solid rgba(212,175,85,0.12)",
        borderRadius: 1,
        background: "rgba(212,175,85,0.02)",
      }}
    >
      <Box
        aria-hidden
        sx={{
          flex: "0 0 40px",
          height: 60,
          alignSelf: "flex-start",
          borderRadius: 0.5,
          border: "1px solid rgba(212,175,85,0.15)",
          background: isGradient ? value : `center / cover no-repeat url("${value}")`,
        }}
      />
      <Box sx={{ flex: 1, minWidth: 0, flexBasis: { xs: "calc(100% - 52px)", sm: "auto" } }}>
        <Typography sx={{ ...whenSx, mb: 0.5, whiteSpace: "normal" }}>
          {invite.day ? `${dayLabel(invite.day)} · ` : ""}Were you there?
        </Typography>
        <Typography
          sx={{ fontSize: { xs: "0.82rem", sm: "0.85rem" }, lineHeight: 1.45, color: "#E8DCC8" }}
        >
          <Link href={`/users/${invite.from}`} underline="hover">
            {invite.from}
          </Link>{" "}
          says you were at{" "}
          <Box
            component="span"
            sx={{ fontFamily: '"Cormorant Garamond", serif', fontSize: "1rem", fontWeight: 600 }}
          >
            {invite.title}
          </Box>
          {invite.theatre && ` at ${invite.theatre}`}.
        </Typography>
      </Box>
      {status ? (
        <Typography
          role="status"
          sx={{ ...mutedSx, fontSize: "0.82rem", ml: { xs: "auto", sm: 0 } }}
        >
          {status}
        </Typography>
      ) : (
        <Box sx={{ display: "flex", gap: 1, ml: "auto", flex: "0 0 auto" }}>
          <Button
            sx={{ ...buttonSx, color: "rgba(232,220,200,0.7)" }}
            onClick={() => onRespond(false)}
          >
            Not me
          </Button>
          <Button sx={buttonSx} variant="outlined" onClick={() => onRespond(true)}>
            Add to my log
          </Button>
        </Box>
      )}
    </Box>
  );
}

function YourShows({ tonight, morningAfter, upcoming, sessionUser }: Props) {
  const [morningHidden, setMorningHidden] = useState(false);
  const [invites, setInvites] = useState<CompanionInvite[]>([]);
  const [answered, setAnswered] = useState<Map<number, string>>(new Map());

  useEffect(() => {
    if (morningAfter && readDismissed().includes(morningAfter.attendanceId)) setMorningHidden(true);
  }, [morningAfter]);

  useEffect(() => {
    fetch("/api/user/companions")
      .then((r) => (r.ok ? r.json() : { invites: [] }))
      .then((d) => setInvites(d.invites ?? []))
      .catch(() => setInvites([]));
  }, []);

  function dismissMorning() {
    if (!morningAfter) return;
    try {
      localStorage.setItem(
        DISMISS_KEY,
        JSON.stringify([...readDismissed(), morningAfter.attendanceId].slice(-20))
      );
    } catch {
      // Storage can be unavailable; hiding for this visit is enough.
    }
    setMorningHidden(true);
  }

  async function respond(id: number, accept: boolean) {
    const res = await fetch("/api/user/companions", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, action: accept ? "accept" : "decline" }),
    }).catch(() => null);
    setAnswered((m) =>
      new Map(m).set(
        id,
        res?.ok ? (accept ? "Added to your log." : "Dismissed.") : "Couldn't save. Try again later."
      )
    );
  }

  const lastNight = morningAfter && !morningHidden ? morningAfter : null;
  const next = upcoming.slice(0, MAX_NEXT);
  const hasTimeline = Boolean(lastNight || tonight || next.length > 0);
  if (!hasTimeline && invites.length === 0) return null;

  const item = { flex: "0 0 auto", scrollSnapAlign: "start" } as const;

  return (
    <Box aria-label="Your shows" component="section" sx={{ mb: { xs: 4.5, sm: 5 } }}>
      <Header moreHref={upcoming.length > MAX_NEXT ? `/users/${sessionUser}/upcoming` : null} />

      {/* On a phone tonight leads at full width, above the scrolling row. */}
      {tonight && (
        <Box sx={{ display: { xs: "block", sm: "none" }, mb: 2 }}>
          <Typography sx={{ ...whenSx, color: "#D4AF55", letterSpacing: "0.22em" }}>
            Tonight
          </Typography>
          <TonightCard sheet={tonight} />
        </Box>
      )}

      {(lastNight || next.length > 0 || tonight) && (
        <Box
          component="ol"
          sx={{
            display: { xs: lastNight || next.length > 0 ? "flex" : "none", sm: "flex" },
            alignItems: "flex-start",
            gap: { xs: 1.25, sm: 2 },
            m: 0,
            p: 0,
            pb: 1,
            listStyle: "none",
            overflowX: "auto",
            scrollSnapType: "x proximity",
            // Phones scroll the row by touch; desktops keep a thin bar for the mouse.
            scrollbarWidth: { xs: "none", sm: "thin" },
          }}
        >
          {lastNight && (
            <Box component="li" sx={item}>
              <Typography sx={whenSx}>
                Last night
                <Box component="span" sx={{ display: { xs: "none", sm: "inline" } }}>
                  {" · "}
                  {dayLabel(lastNight.day)}
                </Box>
              </Typography>
              <RateCard card={lastNight} onDismiss={dismissMorning} />
            </Box>
          )}
          {tonight && (
            <Box component="li" sx={{ ...item, display: { xs: "none", sm: "block" } }}>
              <Typography sx={{ ...whenSx, color: "#D4AF55", letterSpacing: "0.22em" }}>
                Tonight
              </Typography>
              <TonightCard sheet={tonight} />
            </Box>
          )}
          {next.map((entry) => (
            <Box key={entry.id} component="li" sx={item}>
              <Typography sx={whenSx}>{dayLabel(entry.performances.startTime)}</Typography>
              <NextCard entry={entry} />
            </Box>
          ))}
        </Box>
      )}

      {invites.length > 0 && (
        <Box sx={{ display: "grid", gap: 1, mt: hasTimeline ? 2 : 0 }}>
          {invites.map((inv) => (
            <InviteRow
              key={inv.id}
              invite={inv}
              status={answered.get(inv.id)}
              onRespond={(accept) => respond(inv.id, accept)}
            />
          ))}
        </Box>
      )}
    </Box>
  );
}

export default YourShows;
