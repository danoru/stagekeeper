import { Box, Grid, Typography } from "@mui/material";
import type { attendance, musicals, performances, plays, theatres, users } from "@prisma/client";

import DetailInfoCard from "../cards/DetailInfoCard";

interface Props {
  trim: number;
  upcomingPerformances: (attendance & {
    performances: performances & {
      musicals: musicals;
      plays: plays;
      theatres: theatres;
    };
    users: users;
  })[];
}

function FriendUpcomingActivity({ trim, upcomingPerformances }: Props) {
  const uniquePerformances = new Set<string>();
  const upcoming = upcomingPerformances
    .filter((a) => {
      const type = a.performances.type;
      let title: string | undefined;
      if (type === "MUSICAL") {
        title = a.performances.musicals?.title;
      } else if (type === "PLAY") {
        title = a.performances.plays.title;
      }
      const date = a.performances.startTime;
      if (!title || !date) return false;

      const uniqueKey = `${type}-${title}-${date}`;
      if (!uniquePerformances.has(uniqueKey)) {
        uniquePerformances.add(uniqueKey);
        return true;
      }
      return false;
    })
    .slice(0, trim);

  return (
    <>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 2,
          mb: 2.5,
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
          Upcoming From Friends
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
            The stage is quiet for now.
          </Typography>
          <Typography
            sx={{
              fontFamily: '"DM Sans", sans-serif',
              fontSize: "0.7rem",
              color: "rgba(232,220,200,0.2)",
              letterSpacing: "0.04em",
            }}
          >
            Follow friends to see their upcoming shows here.
          </Typography>
        </Box>
      ) : (
        <Grid container columnSpacing={1} rowSpacing={1} sx={{ mb: 2, justifyContent: "center" }}>
          {upcoming.map(
            (
              entry: attendance & {
                performances: performances & {
                  musicals: musicals;
                  theatres: theatres;
                  plays: plays;
                };
                users: users;
              },
              i: number
            ) => {
              const isMusical = entry.performances.type === "MUSICAL";
              const image = isMusical
                ? entry.performances.musicals?.playbill
                : entry.performances.plays.playbill;
              const show = isMusical
                ? entry.performances.musicals?.title
                : entry.performances.plays.title;
              return (
                <DetailInfoCard
                  key={`card-${i}`}
                  date={entry.performances.startTime}
                  image={image}
                  show={show}
                  sx={{
                    height: "100%",
                    width: "100%",
                  }}
                  theatre={entry.performances.theatres.name}
                  type={entry.performances.type}
                  username={entry.users?.username}
                />
              );
            }
          )}
        </Grid>
      )}
    </>
  );
}

export default FriendUpcomingActivity;
