import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import type { attendance, musicals, performances, plays, theatres } from "@prisma/client";

interface Props {
  highlights: (attendance & {
    performances: performances & { musicals: musicals; plays: plays; theatres: theatres };
  })[];
}

function Highlights({ highlights }: Props) {
  const { musicalCount, playCount, totalDuration } = highlights.reduce(
    (accumulator, highlight) => {
      const { musicals, plays, type } = highlight.performances;
      if (type === "MUSICAL") accumulator.musicalCount += 1;
      if (type === "PLAY") accumulator.playCount += 1;
      const duration = musicals?.duration ?? plays?.duration ?? 150;
      accumulator.totalDuration += duration;
      return accumulator;
    },
    { musicalCount: 0, playCount: 0, totalDuration: 0 }
  );

  function convertTime(num: number) {
    const hours = Math.floor(num / 60);
    const minutes = num % 60;
    return `${hours}h ${minutes}m`;
  }

  // Logs without a theatre are shown as "Unknown theatre" (id 0), which isn't a stage or a city.
  const knownTheatres = highlights
    .map((h) => h.performances.theatres)
    .filter((theatre) => theatre.id !== 0);
  const locationCount = new Set(knownTheatres.map((t) => t.location).filter(Boolean)).size;
  const stageCount = new Set(knownTheatres.map((t) => t.id)).size;

  const stats = [
    { value: musicalCount, label: "Musicals" },
    { value: playCount, label: "Plays" },
    { value: convertTime(totalDuration), label: "On Stage" },
    { value: locationCount, label: "Cities" },
    { value: stageCount, label: "Stages" },
  ];

  return (
    <Box sx={{ borderBottom: "1px solid rgba(212,175,85,0.12)" }}>
      {/* Top gradient line */}
      <Box
        sx={{
          height: "2px",
          background:
            "linear-gradient(90deg, transparent, rgba(212,175,85,0.6), rgba(207,68,68,0.4), transparent)",
        }}
      />

      <Container maxWidth="lg">
        <Box
          sx={{
            display: "grid",
            // Two columns on phones, where five don't fit, with the odd one out across the bottom.
            gridTemplateColumns: { xs: "repeat(2, 1fr)", sm: `repeat(${stats.length}, 1fr)` },
            py: 0,
          }}
        >
          {stats.map((stat, i) => (
            <Box
              key={stat.label}
              sx={{
                py: 3,
                px: 2,
                textAlign: "center",
                gridColumn: { xs: i === stats.length - 1 ? "1 / -1" : "auto", sm: "auto" },
                borderBottom: {
                  xs: i < stats.length - 1 ? "1px solid rgba(212,175,85,0.1)" : "none",
                  sm: "none",
                },
                borderRight: {
                  xs:
                    i % 2 === 0 && i < stats.length - 1 ? "1px solid rgba(212,175,85,0.1)" : "none",
                  sm: i < stats.length - 1 ? "1px solid rgba(212,175,85,0.1)" : "none",
                },
                cursor: "default",
                transition: "background 0.2s",
                "&:hover": { background: "rgba(212,175,85,0.04)" },
              }}
            >
              <Typography
                sx={{
                  fontFamily: '"Cormorant Garamond", serif',
                  fontSize: { xs: "1.6rem", md: "2.2rem" },
                  fontWeight: 600,
                  color: "#D4AF55",
                  lineHeight: 1,
                }}
              >
                {stat.value}
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
      </Container>

      {/* Bottom gradient line */}
      <Box
        sx={{
          height: "2px",
          background:
            "linear-gradient(90deg, transparent, rgba(212,175,85,0.6), rgba(207,68,68,0.4), transparent)",
        }}
      />
    </Box>
  );
}

export default Highlights;
