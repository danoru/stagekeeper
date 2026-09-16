import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import type { PerformanceType } from "@prisma/client";

import ShowCard from "../cards/ShowCard";

export interface ShowListItem {
  id: number;
  title: string;
  playbill: string;
  type: PerformanceType;
}

export function showKey(type: PerformanceType, id: number) {
  return `${type}-${id}`;
}

interface Props {
  shows: ShowListItem[];
  header: string;
  style?: string;
  /** `showKey(...)` values for shows with a run on now or soon; they get a "Soon" badge. */
  upcomingShowKeys?: string[];
  emptyMessage?: string;
}

function ShowList({ shows, header, upcomingShowKeys, emptyMessage }: Props) {
  const upcoming = new Set(upcomingShowKeys ?? []);

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
        {shows.map((show) => {
          const showType = show.type === "MUSICAL" ? "musicals" : "plays";
          return (
            <ShowCard
              key={showKey(show.type, show.id)}
              hasUpcomingPerformance={upcoming.has(showKey(show.type, show.id))}
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
