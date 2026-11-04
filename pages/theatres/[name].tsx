import { Box, Container, Grid, Stack, Typography } from "@mui/material";
import { musicals, plays, programming, seasons, theatres } from "@prisma/client";
import moment from "moment";
import { GetServerSidePropsContext } from "next";
import superjson from "superjson";

import ProgramCard from "../../src/components/cards/ProgramCard";
import PageMeta from "../../src/components/layout/PageMeta";
import PerformanceCalendar from "../../src/components/schedule/PerformanceCalendar";
import ReportButton from "../../src/components/shows/ReportButton";
import { getTheatreByName, getCurrentSeason } from "../../src/data/theatres";
import { canViewPending } from "../../src/data/visibility";
import { showPath, theatrePath } from "../../src/utils/slug";
import { getViewer } from "../../src/utils/viewer";

interface Props {
  theatre: Omit<theatres, "scrapeConfig" | "seasonUrl">;
  seasons: (seasons & {
    programming: (programming & { musicals: musicals; plays: plays })[];
  })[];
}

function TheatrePage({ theatre, seasons }: Props) {
  const theatreName = theatre.name;
  const centered = {
    alignItems: { xs: "center", md: "flex-start" },
    textAlign: { xs: "center", md: "left" },
    width: "100%",
  } as const;

  return (
    <div>
      <PageMeta
        description={`${theatre.name}${theatre.location ? ` in ${theatre.location}` : ""}: season schedule and upcoming shows on StageKeeper.`}
        path={theatrePath(theatre.name)}
        title={theatre.name}
      />
      <Container maxWidth="lg" sx={{ px: { xs: 2, md: 3 } }}>
        <Stack direction="column" sx={{ ...centered, marginTop: "2vh" }}>
          <Typography
            gutterBottom
            color="secondary"
            component="h1"
            sx={{ fontSize: { xs: "1.6rem", md: "2.125rem" } }}
            variant="h4"
          >
            {theatre.name}
          </Typography>
          {theatre.location && (
            <Typography gutterBottom component="p" variant="body2">
              {theatre.location}
            </Typography>
          )}
        </Stack>
        {seasons.map((season) => (
          <Box key={season.id} sx={{ marginTop: "2vh" }}>
            <Stack direction="column" sx={centered}>
              <Typography gutterBottom color="secondary" component="h2" variant="h6">
                {season.name}
              </Typography>
              <Typography gutterBottom component="p" variant="body2">
                {`From ${moment.utc(season.startDate).format("ll")} to ${moment
                  .utc(season.endDate)
                  .format("ll")}`}
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
                      link={showPath(showType, show)}
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
      <ReportButton targetId={theatre.id} targetType="THEATRE" />
    </div>
  );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const theatre = await getTheatreByName(String(context.params?.name));

  if (!theatre) {
    return { notFound: true };
  }

  // Pending theatres are checked per viewer and never cached; approved ones are the same for
  // everyone, so the CDN can hold them for a few minutes.
  if (theatre.status === "PENDING") {
    const viewer = await getViewer(context);
    if (!(await canViewPending({ theatre: theatre.id }, theatre.createdBy, viewer))) {
      return { notFound: true };
    }
    context.res.setHeader("Cache-Control", "private, no-store");
  } else {
    context.res.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=600");
  }

  const seasons = await getCurrentSeason(theatre.id);

  // The importer's settings are admin-only.
  const publicTheatre: Props["theatre"] & Partial<theatres> = { ...theatre };
  delete publicTheatre.scrapeConfig;
  delete publicTheatre.seasonUrl;

  return {
    props: superjson.serialize({
      theatre: publicTheatre,
      seasons: seasons || [],
    }).json,
  };
}

export default TheatrePage;
