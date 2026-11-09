import { Box, Button, Stack, Typography } from "@mui/material";
import Image from "next/image";

import type { StageBoard } from "../../utils/stageBoard";
import WeeklyBoard from "../shows/WeeklyBoard";

interface Props {
  board: StageBoard | null;
}

function LoggedOutHomePage({ board }: Props) {
  // Live counts from the week's runs. A stat that would read zero is left out, and the whole
  // strip goes when nothing is on.
  const stats = board
    ? [
        { n: board.productions, label: "On Stage This Week" },
        { n: board.theatres, label: board.theatres === 1 ? "Theatre" : "Theatres" },
        { n: board.opening.length, label: "Opening This Week" },
      ].filter((stat) => stat.n > 0)
    : [];

  return (
    <Box sx={{ minHeight: "100vh", background: "#080C14" }}>
      {/* Hero */}
      <Box
        sx={{
          position: "relative",
          minHeight: "80vh",
          display: "flex",
          alignItems: "center",
          overflow: "hidden",
        }}
      >
        {/* Broadway photo, deeply dimmed */}
        <Image
          fill
          priority
          alt="Broadway"
          src="/images/broadway.jpg"
          style={{ objectFit: "cover", opacity: 0.12 }}
        />

        {/* Curtain vignette edges */}
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse at center, transparent 40%, rgba(8,12,20,0.85) 100%)",
            pointerEvents: "none",
          }}
        />
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            bottom: 0,
            width: "80px",
            background: "linear-gradient(90deg, rgba(100,0,0,0.12), transparent)",
            pointerEvents: "none",
          }}
        />
        <Box
          sx={{
            position: "absolute",
            top: 0,
            right: 0,
            bottom: 0,
            width: "80px",
            background: "linear-gradient(270deg, rgba(100,0,0,0.12), transparent)",
            pointerEvents: "none",
          }}
        />

        {/* Gold horizontal lines */}
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "1px",
            background: "linear-gradient(90deg, transparent, rgba(212,175,85,0.3), transparent)",
            pointerEvents: "none",
          }}
        />
        <Box
          sx={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "1px",
            background: "linear-gradient(90deg, transparent, rgba(212,175,85,0.3), transparent)",
            pointerEvents: "none",
          }}
        />

        {/* Content */}
        <Box
          sx={{
            position: "relative",
            zIndex: 1,
            maxWidth: 700,
            mx: "auto",
            px: 4,
            textAlign: "center",
          }}
        >
          {/* Eyebrow */}
          <Box
            sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 2, mb: 3 }}
          >
            <Box
              sx={{ flex: 1, maxWidth: 60, height: "1px", background: "rgba(212,175,85,0.4)" }}
            />
            <Typography
              sx={{
                fontFamily: '"DM Sans", sans-serif',
                fontSize: "0.65rem",
                letterSpacing: "0.25em",
                textTransform: "uppercase",
                color: "#D4AF55",
              }}
            >
              Your Theatre Archive
            </Typography>
            <Box
              sx={{ flex: 1, maxWidth: 60, height: "1px", background: "rgba(212,175,85,0.4)" }}
            />
          </Box>

          {/* Title */}
          <Typography
            component="h1"
            sx={{
              fontFamily: '"Cormorant Garamond", serif',
              fontSize: { xs: "3.5rem", md: "5.5rem" },
              fontWeight: 300,
              color: "#E8DCC8",
              lineHeight: 0.95,
              letterSpacing: "-0.01em",
              mb: 1,
            }}
          >
            The Stage
          </Typography>
          <Typography
            component="h1"
            sx={{
              fontFamily: '"Cormorant Garamond", serif',
              fontSize: { xs: "3.5rem", md: "5.5rem" },
              fontWeight: 600,
              color: "#D4AF55",
              lineHeight: 0.95,
              letterSpacing: "-0.01em",
              mb: 4,
            }}
          >
            Never Forgets
          </Typography>

          {/* Subtext */}
          <Typography
            sx={{
              fontFamily: '"Cormorant Garamond", serif',
              fontStyle: "italic",
              fontSize: "1.2rem",
              color: "rgba(232,220,200,0.55)",
              lineHeight: 1.7,
              mb: 5,
              maxWidth: 480,
              mx: "auto",
            }}
          >
            Every performance you&apos;ve witnessed, every theatre you&apos;ve sat in. Your complete
            record of live theatre, beautifully kept.
          </Typography>

          {/* CTAs */}
          <Stack direction="row" justifyContent="center" spacing={2}>
            <Button
              href="/register"
              sx={{
                px: 4,
                py: 1.5,
                fontSize: "0.75rem",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
              }}
              variant="contained"
            >
              Start Your Archive
            </Button>
            <Button
              href="/musicals"
              sx={{
                px: 4,
                py: 1.5,
                fontSize: "0.75rem",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
              }}
              variant="outlined"
            >
              Browse Shows
            </Button>
          </Stack>
        </Box>
      </Box>

      {/* Stats strip */}
      <Box
        sx={{
          borderTop: "1px solid rgba(212,175,85,0.15)",
          borderBottom: "1px solid rgba(212,175,85,0.15)",
          background: "linear-gradient(90deg, #0A0F1A, #0D1520, #0A0F1A)",
          display: stats.length > 0 ? "grid" : "none",
          gridTemplateColumns: `repeat(${stats.length}, 1fr)`,
        }}
      >
        {stats.map((stat, i) => (
          <Box
            key={stat.label}
            sx={{
              py: 3,
              px: 1,
              textAlign: "center",
              borderRight: i < stats.length - 1 ? "1px solid rgba(212,175,85,0.1)" : "none",
            }}
          >
            <Typography
              sx={{
                fontFamily: '"Cormorant Garamond", serif',
                fontSize: "2.2rem",
                fontWeight: 600,
                color: "#D4AF55",
                lineHeight: 1,
              }}
            >
              {stat.n}
            </Typography>
            <Typography
              sx={{
                fontFamily: '"DM Sans", sans-serif',
                fontSize: "0.58rem",
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: "rgba(232,220,200,0.35)",
                mt: 0.5,
              }}
            >
              {stat.label}
            </Typography>
          </Box>
        ))}
      </Box>

      {/* This week's runs; the strip above already carries the counts */}
      {board && board.productions > 0 && (
        <Box sx={{ maxWidth: 1200, mx: "auto", px: { xs: 2, md: 4 }, pt: 6 }}>
          <WeeklyBoard board={board} summary={false} />
        </Box>
      )}

      {/* Feature strip */}
      <Box sx={{ maxWidth: 860, mx: "auto", px: 4, py: 8 }}>
        <Stack direction={{ xs: "column", md: "row" }} justifyContent="center" spacing={6}>
          {[
            {
              title: "Track Every Show",
              body: "Log musicals and plays with your rating, notes, and the exact theatre you saw them in.",
            },
            {
              title: "Follow Friends",
              body: "See what your friends have been watching and plan outings together.",
            },
            {
              title: "Your Year in Review",
              body: "Stunning stats on how much time you've spent in the theatre — hours, stages, cities.",
            },
          ].map((f) => (
            <Box key={f.title} sx={{ flex: 1, textAlign: "center" }}>
              <Box sx={{ width: 32, height: 1, background: "#D4AF55", mx: "auto", mb: 2 }} />
              <Typography
                sx={{
                  fontFamily: '"Cormorant Garamond", serif',
                  fontSize: "1.2rem",
                  fontWeight: 600,
                  color: "#E8DCC8",
                  mb: 1,
                }}
              >
                {f.title}
              </Typography>
              <Typography
                sx={{
                  fontFamily: '"DM Sans", sans-serif',
                  fontSize: "0.82rem",
                  color: "rgba(232,220,200,0.5)",
                  lineHeight: 1.7,
                }}
              >
                {f.body}
              </Typography>
            </Box>
          ))}
        </Stack>
      </Box>
    </Box>
  );
}

export default LoggedOutHomePage;
