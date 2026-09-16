import { Box, Grid, Typography } from "@mui/material";

import type { NormalizedAttendance } from "../../data/performances";
import DetailInfoCard from "../cards/DetailInfoCard";

interface Props {
  emptyHint?: string;
  emptyTitle?: string;
  title?: string;
  trim: number;
  upcomingPerformances: NormalizedAttendance[];
}

function FriendUpcomingActivity({
  emptyHint = "Follow friends to see their upcoming shows here.",
  emptyTitle = "The stage is quiet for now.",
  title = "Upcoming From Friends",
  trim,
  upcomingPerformances,
}: Props) {
  const upcoming = upcomingPerformances.slice(0, trim);

  return (
    <>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 2,
          mb: 2.5,
          mt: 4,
          "&:first-of-type": { mt: 0 },
        }}
      >
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
          {title}
        </Typography>
        <Box sx={{ flex: 1, height: "1px", background: "rgba(212,175,85,0.2)" }} />
      </Box>
      {upcoming.length === 0 ? (
        <Box
          sx={{
            border: "1px solid rgba(212,175,85,0.08)",
            borderRadius: 1,
            py: 4,
            px: 3,
            textAlign: "center",
            background: "rgba(212,175,85,0.02)",
            mb: 2,
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
            {emptyTitle}
          </Typography>
          <Typography
            sx={{
              fontFamily: '"DM Sans", sans-serif',
              fontSize: "0.7rem",
              color: "rgba(232,220,200,0.2)",
              letterSpacing: "0.04em",
            }}
          >
            {emptyHint}
          </Typography>
        </Box>
      ) : (
        <Grid container columnSpacing={1} rowSpacing={1} sx={{ mb: 2, justifyContent: "center" }}>
          {upcoming.map((entry) => {
            const perf = entry.performances;
            const show = perf.type === "MUSICAL" ? perf.musicals : perf.plays;
            if (!show) return null;
            return (
              <DetailInfoCard
                key={`card-${entry.id}`}
                date={perf.startTime}
                image={show.playbill}
                show={show.title}
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

export default FriendUpcomingActivity;
