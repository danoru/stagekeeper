import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import type { attendance, musicals, performances, plays, theatres } from "@prisma/client";

import DetailInfoCard from "../cards/DetailInfoCard";

interface Props {
  trim: number;
  upcomingPerformances: (attendance & {
    performances: performances & {
      musicals: musicals;
      plays: plays;
      theatres: theatres;
    };
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
      <Grid
        sx={{
          borderBottomWidth: "1px",
          borderBottomStyle: "solid",
          borderBottomColor: "theme.palette.secondary",
          display: "flex",
          justifyContent: "space-between",
          lineHeight: "0",
          margin: "0 auto",
          width: "75%",
        }}
      >
        <Typography component="div" variant="overline">
          UPCOMING SHOWS FROM FRIENDS
        </Typography>
      </Grid>
      <Grid
        container
        columnSpacing={2}
        rowSpacing={1}
        sx={{
          margin: "10px auto",
          maxWidth: "75%",
        }}
      >
        {upcoming.map(
          (
            entry: attendance & {
              performances: performances & {
                musicals: musicals;
                theatres: theatres;
                plays: plays;
              };
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
              />
            );
          }
        )}
      </Grid>
    </>
  );
}

export default FriendUpcomingActivity;
