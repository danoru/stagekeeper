import Grid from "@mui/material/Grid";
import MusicalCard from "../cards/MusicalCard";
import Typography from "@mui/material/Typography";
import { musicals, programming } from "@prisma/client";

interface Props {
  musicals: musicals[];
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
    musicals: musicals;
  })[];
}
function MusicalList({ musicals, header, style, upcomingPerformances }: Props) {
  const styledHeader = header.toUpperCase();
  const typographyStyle = style || "h6";

  const hasUpcomingPerformance = (musicalId: number) => {
    return upcomingPerformances?.some(
      (performance) => performance.musicals?.id === musicalId
    );
  };

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
        <Typography variant={typographyStyle} component="div">
          {styledHeader}
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
        {musicals?.map((musical: any, i: number) => (
          <MusicalCard
            key={`card-${i}`}
            name={musical?.title}
            link={`/musicals/${musical?.title
              .replace(/\s+/g, "-")
              .toLowerCase()}`}
            image={musical?.playbill}
            hasUpcomingPerformance={hasUpcomingPerformance(musical?.id)}
          />
        ))}
      </Grid>
    </Grid>
  );
}

export default MusicalList;
