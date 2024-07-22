import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import { musicals } from "@prisma/client";
import InfoCard from "../layout/InfoCard";
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
}
function MusicalList({ musicals, header, style }: Props) {
  const styledHeader = header.toUpperCase();
  const typographyStyle = style || "h6";

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
          <InfoCard
            key={`card-${i}`}
            name={musical.name}
            link={`musicals/${musical.link}`}
            image={musical.image}
            sx={{
              width: "100%",
              height: "100%",
            }}
          />
        ))}
      </Grid>
    </Grid>
  );
}

export default MusicalList;
