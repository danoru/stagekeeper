import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import type { musicals, plays, programming } from "@prisma/client";

import ShowCard from "../cards/ShowCard";

interface Props {
  shows: (musicals | plays)[];
  header: string;
  style?:
    | "h1"
    | "h2"
    | "h3"
    | "h4"
    | "h5"
    | "h6"
    | "subtitle1"
    | "subtitle2"
    | "body1"
    | "body2"
    | "caption"
    | "button"
    | "overline"
    | undefined;
  upcomingPerformances?: (programming & {
    musicals?: musicals;
    plays?: plays;
  })[];
}
function ShowList({ shows, header, style, upcomingPerformances }: Props) {
  const styledHeader = header.toUpperCase();
  const typographyStyle = style || "h6";

  const hasUpcomingPerformance = (showId: number) => {
    return upcomingPerformances?.some(
      (performance) => performance.musicals?.id === showId || performance.plays?.id === showId
    );
  };

  return (
    <Grid container>
      <Grid
        style={{
          borderBottomWidth: "1px",
          borderBottomStyle: "solid",
          borderBottomColor: "secondary",
          display: "flex",
          justifyContent: "space-between",
          lineHeight: "0",
          margin: "0 auto",
          width: "75%",
        }}
      >
        <Typography component="div" variant={typographyStyle}>
          {styledHeader}
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
        {shows.map((show, i) => {
          const showType = "musicBy" in show ? "musicals" : "plays";
          return (
            <ShowCard
              key={`card-${i}`}
              hasUpcomingPerformance={hasUpcomingPerformance(show?.id)}
              image={show?.playbill}
              link={`/${showType}/${show?.title.replace(/\s+/g, "-").toLowerCase()}`}
              name={show?.title}
            />
          );
        })}
      </Grid>
    </Grid>
  );
}

export default ShowList;
