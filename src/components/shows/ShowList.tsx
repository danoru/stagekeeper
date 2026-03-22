import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import type { musicals, plays, programming } from "@prisma/client";

import ShowCard from "../cards/ShowCard";

interface Props {
  shows: (musicals | plays)[];
  header: string;
  style?: string;
  upcomingPerformances?: (programming & {
    musicals?: musicals;
    plays?: plays;
  })[];
  emptyMessage?: string;
}

function ShowList({ shows, header, upcomingPerformances, emptyMessage }: Props) {
  const hasUpcomingPerformance = (showId: number) => {
    return upcomingPerformances?.some(
      (performance) => performance.musicals?.id === showId || performance.plays?.id === showId
    );
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Section header */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
        <Typography
          sx={{
            fontFamily: '"DM Sans", sans-serif',
            fontSize: "0.62rem",
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: "#D4AF55",
            whiteSpace: "nowrap",
          }}
        >
          {header}
        </Typography>
        <Box sx={{ flex: 1, height: "1px", background: "rgba(212,175,85,0.2)" }} />
        {shows?.length > 0 && (
          <Typography
            sx={{
              fontFamily: '"DM Sans", sans-serif',
              fontSize: "0.62rem",
              letterSpacing: "0.1em",
              color: "rgba(232,220,200,0.3)",
              whiteSpace: "nowrap",
            }}
          >
            {shows.length} {shows.length === 1 ? "title" : "titles"}
          </Typography>
        )}
      </Box>

      {/* Empty state */}
      {(!shows || shows.length === 0) && (
        <Box
          sx={{
            border: "1px solid rgba(212,175,85,0.08)",
            borderRadius: 1,
            py: 6,
            textAlign: "center",
            background: "rgba(212,175,85,0.02)",
          }}
        >
          <Typography
            sx={{
              fontFamily: '"Cormorant Garamond", serif',
              fontStyle: "italic",
              fontSize: "1.05rem",
              color: "rgba(232,220,200,0.3)",
              mb: 0.5,
            }}
          >
            {emptyMessage || "Nothing here yet."}
          </Typography>
        </Box>
      )}

      {/* Cards */}
      <Box sx={{ display: "flex", flexWrap: "wrap", justifyContent: "center" }}>
        {shows?.map((show, i) => {
          if (!show) return null;
          const showType = "musicBy" in show ? "musicals" : "plays";
          return (
            <ShowCard
              key={`card-${i}`}
              hasUpcomingPerformance={hasUpcomingPerformance(show.id)}
              image={show.playbill}
              link={`/${showType}/${show.title.replace(/\s+/g, "-").toLowerCase()}`}
              name={show.title}
            />
          );
        })}
      </Box>
    </Container>
  );
}

export default ShowList;
