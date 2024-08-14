import DetailInfoCard from "../cards/DetailInfoCard";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import {
  attendance,
  musicals,
  performances,
  plays,
  theatres,
  users,
} from "@prisma/client";

interface Props {
  recentPerformances: (attendance & {
    performances: performances & {
      musicals: musicals;
      plays: plays;
      theatres: theatres;
    };
    users: users;
  })[];
}

function RecentActivity({ recentPerformances }: Props) {
  const uniquePerformances = new Set<string>();
  const recent = recentPerformances
    .filter((a) => {
      const type = a.performances.type;
      let title: string | undefined;
      if (type === "MUSICAL") {
        title = a.performances.musicals?.title;
      } else if (type === "PLAY") {
        title = a.performances.plays?.title;
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
          RECENT SHOWS
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
                plays: plays;
              };
            },

            i: number
          ) => {
            const isMusical = entry.performances.type === "MUSICAL";
            const image = isMusical
              ? entry.performances.musicals.playbill
              : entry.performances.plays.playbill;
            const show = isMusical
              ? entry.performances.musicals.title
              : entry.performances.plays.title;
            return (
              <DetailInfoCard
                key={`card-${i}`}
                image={image}
                show={show}
                theatre={entry.performances.theatres.name}
                type={entry.performances.type}
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
