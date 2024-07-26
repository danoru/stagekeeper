import DetailInfoCard from "../layout/DetailInfoCard";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import {
  attendance,
  musicals,
  performances,
  theatres,
  users,
} from "@prisma/client";

interface Props {
  recentPerformances: (attendance & {
    performances: performances & {
      musicals: musicals;
      theatres: theatres;
    };
    users: users;
  })[];
}

function RecentActivity({ recentPerformances }: Props) {
  const uniquePerformances = new Set<string>();
  const recent = recentPerformances
    .filter((a) => {
      const title = a.performances.musicals.title;
      const date = a.performances.startTime;
      const uniqueKey = `${title}-${date}`;
      if (!uniquePerformances.has(uniqueKey)) {
        uniquePerformances.add(uniqueKey);
        return true;
      }
      return false;
    })
    .slice(0, 3);

  return (
    <Grid container>
      <Grid
        item
        style={{
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
        <Typography variant="overline" component="div">
          RECENT MUSICALS
        </Typography>
      </Grid>
      <Grid
        container
        item
        rowSpacing={1}
        columnSpacing={2}
        sx={{
          margin: "10px auto",
          maxWidth: "75%",
        }}
      >
        {recent.map(
          (
            entry: attendance & {
              performances: performances & {
                musicals: musicals;
                theatres: theatres;
              };
            },

            i: number
          ) => {
            return (
              <DetailInfoCard
                key={`card-${i}`}
                musical={entry.performances.musicals.title}
                image={entry.performances.musicals.playbill || ""}
                theatre={entry.performances.theatres.name}
                date={entry.performances.startTime}
                sx={{
                  height: "100%",
                  width: "100%",
                }}
              />
            );
          }
        )}
      </Grid>
    </Grid>
  );
}

export default RecentActivity;
