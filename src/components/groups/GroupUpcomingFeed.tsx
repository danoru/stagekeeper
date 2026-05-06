import { Box, Grid, Typography } from "@mui/material";
import type { attendance, musicals, performances, plays, theatres, users } from "@prisma/client";

import DetailInfoCard from "../cards/DetailInfoCard";

type Entry = attendance & {
  performances:
    | (performances & {
        musicals: musicals | null;
        plays: plays | null;
        theatres: theatres;
      })
    | null;
  users: users | null;
};

interface Props {
  upcoming: Entry[];
}

function GroupUpcomingFeed({ upcoming }: Props) {
  const seen = new Set<string>();
  const cards = upcoming.filter((entry) => {
    const perf = entry.performances;
    if (!perf) return false;
    const title = perf.type === "MUSICAL" ? perf.musicals?.title : perf.plays?.title;
    if (!title) return false;
    const key = `${perf.type}-${title}-${perf.startTime}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  return (
    <>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2.5 }}>
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
          Upcoming In The Group
        </Typography>
        <Box sx={{ flex: 1, height: "1px", background: "rgba(212,175,85,0.2)" }} />
      </Box>

      {cards.length === 0 ? (
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
              color: "rgba(232,220,200,0.3)",
              mb: 0.5,
            }}
          >
            No upcoming shows in this group.
          </Typography>
          <Typography
            sx={{
              fontFamily: '"DM Sans", sans-serif',
              fontSize: "0.7rem",
              color: "rgba(232,220,200,0.2)",
              letterSpacing: "0.04em",
            }}
          >
            When members log a future show, it will surface here.
          </Typography>
        </Box>
      ) : (
        <Grid columnSpacing={1} container rowSpacing={1}>
          {cards.map((entry, i) => {
            const perf = entry.performances!;
            const isMusical = perf.type === "MUSICAL";
            const image = isMusical ? perf.musicals?.playbill : perf.plays?.playbill;
            const show = isMusical ? perf.musicals?.title : perf.plays?.title;
            return (
              <DetailInfoCard
                key={`group-upcoming-${i}`}
                date={perf.startTime}
                image={image ?? ""}
                show={show ?? ""}
                sx={{ height: "100%", width: "100%" }}
                theatre={perf.theatres.name}
                type={perf.type}
                username={entry.users?.username}
              />
            );
          })}
        </Grid>
      )}
    </>
  );
}

export default GroupUpcomingFeed;
