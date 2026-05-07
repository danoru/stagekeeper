import { Box, Card, CardMedia, Stack, Typography } from "@mui/material";
import { musicals, performances, theatres } from "@prisma/client";
import moment from "moment";
import Head from "next/head";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import superjson from "superjson";

import PerformanceCalendar from "../../src/components/schedule/PerformanceCalendar";
import ShowActionBar from "../../src/components/shows/ShowActionBar";
import prisma from "../../src/data/db";
import { getMusicalByTitle, getMusicals } from "../../src/data/musicals";
import { getTheatres } from "../../src/data/theatres";

interface Params {
  title: string;
}

interface Props {
  musical: musicals;
  pastPerformances: (performances & { theatres: theatres })[];
  theatres: theatres[];
}

function MusicalPage({ musical, pastPerformances, theatres }: Props) {
  const { data: session } = useSession();
  const sessionUser = session?.user;
  const title = `${musical.title} • StageKeeper`;
  const musicalTitle = musical.title;

  const [userStatus, setUserStatus] = useState<{
    attendance: any[];
    likedShows: any[];
    watchlist: any[];
  } | null>(null);

  useEffect(() => {
    if (session) {
      fetch(`/api/shows/user-status?musicalId=${musical.id}`)
        .then((r) => r.json())
        .then(setUserStatus);
    }
  }, [session, musical.id]);

  return (
    <div>
      <Head>
        <title>{title}</title>
        <meta content="Created with NextJS" name="description" />
        <link href="/favicon.ico" rel="icon" />
      </Head>
      <Stack
        alignItems={{ xs: "center", md: "flex-start" }}
        direction={{ xs: "column", md: "row" }}
        spacing={{ xs: 2, md: 0 }}
        sx={{
          justifyContent: "center",
          marginTop: "2vh",
          px: { xs: 2, md: 0 },
        }}
      >
        <Card
          sx={{
            position: "relative",
            height: "270px",
            width: "211.5px",
            flexShrink: 0,
            marginRight: { xs: 0, md: "2vw" },
            overflow: "hidden",
          }}
        >
          <CardMedia
            className="image"
            image={musical.playbill}
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
            }}
            title={musical.title}
          />
          <Box
            className="overlay"
            style={{
              position: "absolute",
              top: "5px",
              right: "5px",
              bottom: "5px",
              left: "5px",
              border: "2px solid rgba(255, 255, 255, 1)",
              pointerEvents: "none",
            }}
          />
        </Card>
        <Stack
          direction="column"
          sx={{
            alignItems: { xs: "center", md: "flex-start" },
            marginRight: { xs: 0, md: "2vw" },
            textAlign: { xs: "center", md: "left" },
            width: { xs: "100%", md: "50%" },
          }}
        >
          <Stack direction="row" spacing={2} sx={{ flexWrap: "wrap", justifyContent: "inherit" }}>
            <Typography variant="h6">{musical.title}</Typography>
            <Typography variant="h6">{`(${moment(musical.premiere).format("YYYY")})`}</Typography>
          </Stack>
          <Stack direction="column" sx={{ alignItems: "inherit" }}>
            <Typography variant="subtitle1">Music by {musical.musicBy}</Typography>
            <Typography variant="subtitle1">Lyrics by {musical.lyricsBy}</Typography>
            <Typography variant="subtitle1">Book by {musical.bookBy}</Typography>
          </Stack>
        </Stack>
        <Stack sx={{ width: { xs: "100%", sm: "260px", md: "15%" }, maxWidth: "100%" }}>
          <ShowActionBar
            attendance={userStatus?.attendance ?? []}
            likedShows={userStatus?.likedShows ?? []}
            musical={musical}
            pastPerformances={pastPerformances}
            sessionUser={sessionUser}
            theatres={theatres}
            watchlist={userStatus?.watchlist ?? []}
          />
        </Stack>
      </Stack>
      <PerformanceCalendar identifier={musicalTitle} showType="MUSICAL" viewType="show" />
    </div>
  );
}

export async function getStaticPaths() {
  const musicals = await getMusicals();
  const paths = musicals.map((musical: { title: string }) => ({
    params: { title: musical.title.replace(/\s+/g, "-").toLowerCase() },
  }));
  return { paths, fallback: "blocking" };
}

export async function getStaticProps(context: { params: Params }) {
  const { title } = context.params;
  const musical = await getMusicalByTitle(title);

  if (!musical) {
    return { notFound: true };
  }

  const [pastPerformances, theatres] = await Promise.all([
    prisma.performances.findMany({
      where: { musical: musical.id, startTime: { lte: new Date() } },
      include: { theatres: true },
      orderBy: { startTime: "desc" },
      take: 50,
    }),
    getTheatres(),
  ]);

  return {
    props: superjson.serialize({ musical, pastPerformances, theatres }).json,
    revalidate: 86400,
  };
}

export default MusicalPage;
