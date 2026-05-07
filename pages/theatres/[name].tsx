import { Box, Container, Grid, Stack, Typography } from "@mui/material";
import { musicals, plays, programming, seasons, theatres } from "@prisma/client";
import moment from "moment";
import Head from "next/head";
import superjson from "superjson";

import ProgramCard from "../../src/components/cards/ProgramCard";
import PerformanceCalendar from "../../src/components/schedule/PerformanceCalendar";
import { getTheatreByName, getCurrentSeason, getTheatres } from "../../src/data/theatres";

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
      <Container maxWidth="lg" sx={{ px: { xs: 2, md: 3 } }}>
        {seasons.map((season) => (
          <Box key={season.id} sx={{ marginTop: "2vh" }}>
            <Stack
              direction="column"
              sx={{
                alignItems: { xs: "center", md: "flex-start" },
                textAlign: { xs: "center", md: "left" },
                width: "100%",
              }}
            >
              <Typography
                gutterBottom
                color="secondary"
                component="h4"
                sx={{ fontSize: { xs: "1.6rem", md: "2.125rem" } }}
                variant="h4"
              >
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
            <Grid container direction="row" sx={{ justifyContent: "center", flexWrap: "wrap" }}>
              {season.programming.map(
                (program: programming & { musicals: musicals; plays: plays }) => {
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
                }
              )}
            </Grid>
          </Box>
        ))}
      </Container>
      <PerformanceCalendar identifier={theatreName} viewType="theatre" />
    </div>
  );
}

export async function getStaticPaths() {
  const theatres = await getTheatres();
  const paths = theatres.map((theatre: { name: string }) => ({
    params: { name: theatre.name.replace(/\s+/g, "-").toLowerCase() },
  }));
  return { paths, fallback: "blocking" };
}

export async function getStaticProps(context: { params: Params }) {
  const { name } = context.params;
  const theatre = await getTheatreByName(name);
  let seasons: any = [];

  if (theatre) {
    seasons = await getCurrentSeason(theatre.id);
  }

  if (!theatre) {
    return { notFound: true };
  }

  return {
    props: superjson.serialize({
      theatre,
      seasons: seasons || [],
    }).json,
    revalidate: 3600,
  };
}

export default TheatrePage;
