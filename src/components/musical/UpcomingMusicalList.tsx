import Carousel from "react-material-ui-carousel";
import { musicals, programming, seasons, theatres } from "@prisma/client";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Image from "next/image";
import moment from "moment";
import Grid from "@mui/material/Grid";
import Link from "next/link";

interface Props {
  upcomingPerformances: (programming & {
    musicals: musicals;
    seasons: seasons & { theatres: theatres };
  })[];
}

function UpcomingMusicalList({ upcomingPerformances }: Props) {
  return (
    <Grid item>
      <Typography variant="h5">Upcoming Performances</Typography>
      <Carousel sx={{ maxWidth: 300, margin: "auto" }}>
        {upcomingPerformances.map((performance: any) => {
          const musicalSlug = `${performance.musicals.title
            .replace(/\s+/g, "-")
            .toLowerCase()}`;
          return (
            <Link href={`/musicals/${musicalSlug}`}>
              <Paper key={performance.id} className="card">
                <Image
                  src={performance.musicals.playbill || ""}
                  alt={performance.musicals.title}
                  height="185"
                  width="150"
                />
                <Typography variant="h6">
                  {performance.musicals.title}
                </Typography>
                <Typography variant="body2">
                  {moment(performance.startDate).format("LL")} -{" "}
                  {moment(performance.endDate).format("LL")}
                </Typography>
                <Typography variant="body2">
                  {performance.seasons?.theatres.name}
                </Typography>
              </Paper>
            </Link>
          );
        })}
      </Carousel>
    </Grid>
  );
}

export default UpcomingMusicalList;
