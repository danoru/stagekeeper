import Grid from "@mui/material/Grid";
import Head from "next/head";
import moment from "moment";
import PerformanceCalendar from "../../src/components/schedule/PerformanceCalendar";
import ProgramCard from "../../src/components/cards/ProgramCard";
import Stack from "@mui/material/Stack";
import superjson from "superjson";
import Typography from "@mui/material/Typography";
import { getTheatreByName, getSeasons } from "../../src/data/theatres";
import {
  musicals,
  plays,
  programming,
  seasons,
  theatres,
} from "@prisma/client";

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
          {season.programming.map(
            (program: programming & { musicals: musicals; plays: plays }) => {
              const isMusical = program.type === "MUSICAL";
              const showType = isMusical ? "musicals" : "plays";
              const image = isMusical
                ? program.musicals?.playbill
                : program.plays?.playbill;
              const show = isMusical
                ? program.musicals?.title
                : program.plays?.title;
              return (
                <ProgramCard
                  key={program.id}
                  image={image}
                  startDate={program.startDate}
                  show={show}
                  type={program.type}
                  endDate={program.endDate}
                  link={`/${showType}/${show
                    .replace(/\s+/g, "-")
                    .toLowerCase()}`}
                />
              );
            }
          )}
        </Grid>
      ))}
      <PerformanceCalendar viewType="theatre" identifier={theatreName} />
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
