import CheckIcon from "@mui/icons-material/Check";
import { Box, Link, Typography } from "@mui/material";

import { resolveShowImage } from "../../utils/gradients";
import type { HomeTheatreCard, SeasonSlot } from "../../utils/homeTheatres";
import { showPath, theatrePath } from "../../utils/slug";

interface Props {
  theatres: HomeTheatreCard[];
}

const eyebrowSx = {
  fontFamily: '"DM Sans", sans-serif',
  fontSize: "0.62rem",
  letterSpacing: "0.22em",
  textTransform: "uppercase",
  color: "#D4AF55",
  whiteSpace: "nowrap",
} as const;

const lineSx = {
  fontFamily: '"DM Sans", sans-serif',
  fontSize: "0.78rem",
  color: "rgba(232,220,200,0.6)",
} as const;

const SLOT_LABEL: Record<SeasonSlot["state"], string> = {
  seen: "You saw this",
  playing: "On now",
  upcoming: "Coming up",
  past: "Missed",
};

function Slot({ slot }: { slot: SeasonSlot }) {
  const { isGradient, value } = resolveShowImage(slot.playbill, slot.title);
  const dim = slot.state === "past" || slot.state === "upcoming";
  return (
    <Link
      aria-label={`${slot.title}, ${slot.dateLabel}. ${SLOT_LABEL[slot.state]}.`}
      href={showPath(slot.type === "MUSICAL" ? "musicals" : "plays", slot.title)}
      sx={{ display: "block", flex: "0 0 auto" }}
      title={`${slot.title} · ${slot.dateLabel} · ${SLOT_LABEL[slot.state]}`}
    >
      <Box
        sx={{
          position: "relative",
          width: 40,
          height: 60,
          borderRadius: 0.5,
          border: "1px solid",
          borderColor:
            slot.state === "seen"
              ? "#D4AF55"
              : slot.state === "playing"
                ? "rgba(212,175,85,0.6)"
                : "rgba(212,175,85,0.15)",
          background: isGradient ? value : `center / cover no-repeat url("${value}")`,
          opacity: dim ? 0.45 : 1,
          filter: slot.state === "past" ? "grayscale(1)" : "none",
          transition: "opacity 0.2s, transform 0.2s",
          "&:hover": { opacity: 1, transform: "translateY(-2px)" },
        }}
      >
        {slot.state === "seen" && (
          <Box
            sx={{
              position: "absolute",
              right: -6,
              top: -6,
              width: 18,
              height: 18,
              borderRadius: "50%",
              background: "#D4AF55",
              color: "#0D1520",
              display: "grid",
              placeItems: "center",
            }}
          >
            <CheckIcon sx={{ fontSize: 13 }} />
          </Box>
        )}
        {slot.state === "playing" && (
          <Box
            sx={{
              position: "absolute",
              left: 0,
              right: 0,
              bottom: 0,
              py: 0.2,
              textAlign: "center",
              fontFamily: '"DM Sans", sans-serif',
              fontSize: "0.5rem",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "#0D1520",
              background: "rgba(212,175,85,0.9)",
            }}
          >
            Now
          </Box>
        )}
      </Box>
    </Link>
  );
}

function TheatreCard({ theatre }: { theatre: HomeTheatreCard }) {
  const showLink = (line: { type: "MUSICAL" | "PLAY"; title: string }) => (
    <Link
      href={showPath(line.type === "MUSICAL" ? "musicals" : "plays", line.title)}
      sx={{ color: "#E8DCC8", fontWeight: 500 }}
      underline="hover"
    >
      {line.title}
    </Link>
  );

  return (
    <Box
      component="li"
      sx={{
        listStyle: "none",
        p: 2.5,
        border: "1px solid rgba(212,175,85,0.12)",
        borderRadius: 1,
        background: "rgba(212,175,85,0.02)",
      }}
    >
      <Link
        href={theatrePath(theatre.name)}
        sx={{
          fontFamily: '"Cormorant Garamond", serif',
          fontSize: "1.35rem",
          fontWeight: 600,
          color: "#E8DCC8",
          lineHeight: 1.1,
          "&:hover": { color: "#D4AF55" },
        }}
        underline="none"
      >
        {theatre.name}
      </Link>
      {theatre.location && (
        <Typography sx={{ ...lineSx, fontSize: "0.7rem", color: "rgba(232,220,200,0.4)" }}>
          {theatre.location}
        </Typography>
      )}

      <Box sx={{ mt: 1.5, display: "grid", gap: 0.5 }}>
        {theatre.nowPlaying.map((line) => (
          <Typography key={`${line.type}-${line.title}`} sx={lineSx}>
            <Box component="span" sx={{ color: "#D4AF55" }}>
              Now:
            </Box>{" "}
            {showLink(line)} · {line.dateLabel}
          </Typography>
        ))}
        {theatre.next && (
          <Typography sx={lineSx}>
            <Box component="span" sx={{ color: "#D4AF55" }}>
              Next:
            </Box>{" "}
            {showLink(theatre.next)} · {theatre.next.dateLabel}
          </Typography>
        )}
        {theatre.nowPlaying.length === 0 && !theatre.next && (
          <Typography sx={{ ...lineSx, fontStyle: "italic", color: "rgba(232,220,200,0.35)" }}>
            Nothing scheduled yet.
          </Typography>
        )}
      </Box>

      {theatre.season && theatre.season.total > 0 && (
        <Box sx={{ mt: 2 }}>
          <Typography sx={{ ...lineSx, fontSize: "0.68rem", mb: 1 }}>
            {theatre.season.name} ·{" "}
            <Box component="span" sx={{ color: "#D4AF55" }}>
              {theatre.season.seen} of {theatre.season.total}
            </Box>{" "}
            seen
          </Typography>
          <Box sx={{ display: "flex", gap: 1.25, flexWrap: "wrap" }}>
            {theatre.season.slots.map((slot) => (
              <Slot key={slot.id} slot={slot} />
            ))}
          </Box>
        </Box>
      )}
    </Box>
  );
}

/** The member's own theatres: what's on, what's next, and this season as a row of slots. */
function HomeTheatres({ theatres }: Props) {
  return (
    <Box aria-label="Your theatres" component="section" sx={{ mb: 5 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2.5 }}>
        <Typography component="h2" sx={eyebrowSx}>
          Your Theatres
        </Typography>
        <Box sx={{ flex: 1, height: "1px", background: "rgba(212,175,85,0.2)" }} />
        <Link
          href="/theatres"
          sx={{ ...eyebrowSx, color: "rgba(232,220,200,0.4)", "&:hover": { color: "#D4AF55" } }}
          underline="none"
        >
          {theatres.length > 0 ? "Add another" : "Browse theatres"}
        </Link>
      </Box>

      {theatres.length === 0 ? (
        <Box
          sx={{
            border: "1px solid rgba(212,175,85,0.08)",
            borderRadius: 1,
            py: 4,
            px: 3,
            textAlign: "center",
            background: "rgba(212,175,85,0.02)",
          }}
        >
          <Typography
            sx={{
              fontFamily: '"Cormorant Garamond", serif',
              fontStyle: "italic",
              fontSize: "1rem",
              color: "rgba(232,220,200,0.4)",
              mb: 0.5,
            }}
          >
            Pick the stages you go to.
          </Typography>
          <Typography sx={{ ...lineSx, fontSize: "0.72rem", color: "rgba(232,220,200,0.3)" }}>
            Open a theatre and choose &ldquo;Add to my theatres&rdquo;. Its season and what&apos;s
            on will show up here. Only you can see this list.
          </Typography>
        </Box>
      ) : (
        <Box
          component="ul"
          sx={{
            m: 0,
            p: 0,
            display: "grid",
            gap: 2,
            gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
          }}
        >
          {theatres.map((theatre) => (
            <TheatreCard key={theatre.id} theatre={theatre} />
          ))}
        </Box>
      )}
    </Box>
  );
}

export default HomeTheatres;
