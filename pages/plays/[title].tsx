import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardMedia from "@mui/material/CardMedia";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { plays } from "@prisma/client";
import moment from "moment";
import Head from "next/head";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import superjson from "superjson";

import PerformanceCalendar from "../../src/components/schedule/PerformanceCalendar";
import ShowActionBar from "../../src/components/shows/ShowActionBar";
import { getPlayByTitle, getPlays } from "../../src/data/plays";

interface Params {
  title: string;
}

interface Props {
  play: plays;
}

function PlayPage({ play }: Props) {
  const { data: session } = useSession();
  const sessionUser = session?.user;
  const playTitle = play.title;
  const title = `${playTitle} • StageKeeper`;

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
            image={play.playbill}
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
            }}
            title={play.title}
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
            <Typography variant="h6">{play.title}</Typography>
            <Typography variant="h6">{`(${moment(play.premiere).format("YYYY")})`}</Typography>
          </Stack>
          <Stack direction="column" style={{ alignItems: "flex-start" }}>
            <Typography variant="subtitle1">Written by {play.writtenBy}</Typography>
          </Stack>
        </Stack>
        <Stack width="15%">
          <ShowActionBar
            attendance={userStatus?.attendance ?? []}
            likedShows={userStatus?.likedShows ?? []}
            play={play}
            sessionUser={sessionUser}
            watchlist={userStatus?.watchlist ?? []}
          />
        </Stack>
      </Stack>
      <PerformanceCalendar identifier={playTitle} showType="PLAY" viewType="show" />
    </div>
  );
}

export async function getStaticPaths() {
  const plays = await getPlays();
  const paths = plays.map((play: { title: string }) => ({
    params: { title: play.title.replace(/\s+/g, "-").toLowerCase() },
  }));
  return { paths, fallback: "blocking" };
}

export async function getStaticProps(context: { params: Params }) {
  const { title } = context.params;
  const play = await getPlayByTitle(title);

  if (!play) {
    return { notFound: true };
  }

  return {
    props: superjson.serialize({ play }).json,
    revalidate: 86400,
  };
}

export default PlayPage;
