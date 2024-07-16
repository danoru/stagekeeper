import Grid from "@mui/material/Grid";
import Head from "next/head";
import InfoCard from "../../src/components/layout/InfoCard";
import Stack from "@mui/material/Stack";
import superjson from "superjson";
import Typography from "@mui/material/Typography";
import { getTheatreByName, getSeasons } from "../../src/data/theatres";
import { musicals, programming, seasons, theatres } from "@prisma/client";
import moment from "moment";

interface Props {
  theatre: theatres;
  seasons: (seasons & {
    programming: (programming & { musical: musicals })[];
  })[];
}

interface Params {
  name: string;
}

function TheatrePage({ theatre, seasons }: Props) {
  const title = `${theatre.name} • StageKeeper`;
  return (
    <div>
      <Head>
        <title>{title}</title>
      </Head>
      {seasons.map((season) => (
        <Grid
          container
          direction="row"
          sx={{ justifyContent: "center", marginTop: "2vh" }}
          key={season.id}
        >
          <Stack direction="column" width="100%">
            <Typography
              gutterBottom
              variant="h4"
              component="h4"
              color="secondary"
            >
              {theatre.name}
            </Typography>
            <Typography
              gutterBottom
              variant="h6"
              component="h6"
              color="secondary"
            >
              {season.name}
            </Typography>
            <Typography gutterBottom variant="body2" component="p">
              {`From ${moment(season.startDate).format("ll")} to ${moment(
                season.endDate
              ).format("ll")}`}
            </Typography>
          </Stack>
          {season.programming.map((program: any) => (
            <InfoCard
              key={program.musicals.id}
              name={program.musicals.title}
              image={program.musicals.playbill}
            />
          ))}
        </Grid>
      ))}
    </div>
  );
}

export async function getServerSideProps(context: { params: Params }) {
  const { name } = context.params;
  const theatre = await getTheatreByName(name);
  let seasons: any = [];

  if (theatre) {
    seasons = await getSeasons(theatre.id);
  }

  return {
    props: superjson.serialize({
      theatre: theatre || null,
      seasons: seasons || [],
    }).json,
  };
}

export default TheatrePage;
