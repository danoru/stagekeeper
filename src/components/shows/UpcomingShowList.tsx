import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import { musicals, plays, programming, seasons, theatres } from "@prisma/client";
import moment from "moment";
import Image from "next/image";
import Link from "next/link";
import Carousel from "react-material-ui-carousel";

interface Props {
  upcomingPerformances: (programming & {
    musicals?: musicals;
    plays?: plays;
    seasons: seasons & { theatres: theatres };
  })[];
}

function UpcomingShowList({ upcomingPerformances }: Props) {
  return (
    <Grid>
      <Typography sx={{ margin: "2vh 0" }} variant="h5">
        Upcoming Performances
      </Typography>
      <Carousel sx={{ maxWidth: 300, margin: "auto" }}>
        {upcomingPerformances.map((performance: any) => {
          const showType = performance.type === "MUSICAL" ? "musicals" : "plays";
          const title =
            performance.type === "MUSICAL" ? performance.musicals?.title : performance.plays?.title;
          const image =
            performance.type === "MUSICAL"
              ? performance.musicals?.playbill
              : performance.plays?.playbill;
          return (
            <Link href={`/${showType}/${title?.replace(/\s+/g, "-").toLowerCase()}`}>
              <Paper key={performance.id} className="card">
                <Image alt={title} height="185" src={image} width="150" />
                <Typography variant="h6">{title}</Typography>
                <Typography variant="body2">
                  {moment(performance.startDate).format("LL")} -{" "}
                  {moment(performance.endDate).format("LL")}
                </Typography>
                <Typography variant="body2">{performance.seasons?.theatres.name}</Typography>
              </Paper>
            </Link>
          );
        })}
      </Carousel>
    </Grid>
  );
}

export default UpcomingShowList;
