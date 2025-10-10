import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { musicals, plays, programming, seasons, theatres } from "@prisma/client";
import moment from "moment";
import Head from "next/head";
import superjson from "superjson";

import ProgramCard from "../../src/components/cards/ProgramCard";
import PerformanceCalendar from "../../src/components/schedule/PerformanceCalendar";
import { getTheatreByName, getSeasons } from "../../src/data/theatres";

interface Props {
  theatre: theatres;
  seasons: (seasons & {
    programming: (programming & { musicals: musicals; plays: plays })[];
  })[];
}

interface Params {
  name: string;
}

function TheatrePage({ theatre, seasons }: Props) {
  const title = `${theatre.name} • StageKeeper`;
  const theatreName = theatre.name;

  return (
    <div>
      <Head>
        <title>{title}</title>
      </Head>
      {seasons.map((season) => (
        <Grid
          key={season.id}
          container
          direction="row"
          sx={{ justifyContent: "center", marginTop: "2vh" }}
        >
          <Stack direction="column" width="100%">
            <Typography gutterBottom color="secondary" component="h4" variant="h4">
              {theatre.name}
            </Typography>
            <Typography gutterBottom color="secondary" component="h6" variant="h6">
              {season.name}
            </Typography>
            <Typography gutterBottom component="p" variant="body2">
              {`From ${moment(season.startDate).format("ll")} to ${moment(season.endDate).format(
                "ll"
              )}`}
            </Typography>
          </Stack>
          {season.programming.map((program: programming & { musicals: musicals; plays: plays }) => {
            const isMusical = program.type === "MUSICAL";
            const showType = isMusical ? "musicals" : "plays";
            const image = isMusical ? program.musicals?.playbill : program.plays?.playbill;
            const show = isMusical ? program.musicals?.title : program.plays?.title;
            return (
              <ProgramCard
                key={program.id}
                endDate={program.endDate}
                image={image}
                link={`/${showType}/${show.replace(/\s+/g, "-").toLowerCase()}`}
                show={show}
                startDate={program.startDate}
                type={program.type}
              />
            );
          })}
        </Grid>
      ))}
      <PerformanceCalendar identifier={theatreName} viewType="theatre" />
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
