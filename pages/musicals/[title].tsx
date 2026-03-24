import { Box, Card, CardMedia, Stack, Typography } from "@mui/material";
import { musicals } from "@prisma/client";
import moment from "moment";
import Head from "next/head";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import superjson from "superjson";

import PerformanceCalendar from "../../src/components/schedule/PerformanceCalendar";
import ShowActionBar from "../../src/components/shows/ShowActionBar";
import { getMusicalByTitle, getMusicals } from "../../src/data/musicals";

interface Params {
  title: string;
}

interface Props {
  musical: musicals;
}

function MusicalPage({ musical }: Props) {
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
      fetch("/api/shows/user-status")
        .then((r) => r.json())
        .then(setUserStatus);
    }
  }, [session]);

  return (
    <div>
      <Head>
        <title>{title}</title>
        <meta content="Created with NextJS" name="description" />
        <link href="/favicon.ico" rel="icon" />
      </Head>
      <Stack direction="row" sx={{ justifyContent: "center", marginTop: "2vh" }}>
        <Card
          sx={{
            position: "relative",
            height: "270px",
            width: "211.5px",
            marginRight: "2vw",
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
          style={{ alignItems: "flex-start", marginRight: "2vw", width: "50%" }}
        >
          <Stack direction="row" spacing={2}>
            <Typography variant="h6">{musical.title}</Typography>
            <Typography variant="h6">{`(${moment(musical.premiere).format("YYYY")})`}</Typography>
          </Stack>
          <Stack direction="column" style={{ alignItems: "flex-start" }}>
            <Typography variant="subtitle1">Music by {musical.musicBy}</Typography>
            <Typography variant="subtitle1">Lyrics by {musical.lyricsBy}</Typography>
            <Typography variant="subtitle1">Book by {musical.bookBy}</Typography>
          </Stack>
        </Stack>
        <Stack width="15%">
          <ShowActionBar
            attendance={userStatus?.attendance ?? []}
            likedShows={userStatus?.likedShows ?? []}
            musical={musical}
            sessionUser={sessionUser}
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

  return {
    props: superjson.serialize({ musical }).json,
    revalidate: 86400,
  };
}

export default MusicalPage;
