import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardMedia from "@mui/material/CardMedia";
import Head from "next/head";
import moment from "moment";
import ShowActionBar from "../../src/components/shows/ShowActionBar";
import PerformanceCalendar from "../../src/components/schedule/PerformanceCalendar";
import Stack from "@mui/material/Stack";
import superjson from "superjson";
import Typography from "@mui/material/Typography";
import {
  attendance,
  likedShows,
  plays,
  performances,
  watchlist,
} from "@prisma/client";
import {
  getLikedPlays,
  getPlayByTitle,
  getWatchlist,
} from "../../src/data/plays";
import { getSession } from "next-auth/react";
import { getUserAttendance } from "../../src/data/performances";

interface Params {
  title: string;
}

interface Props {
  attendance: (attendance & { performances: performances })[];
  likedPlays: likedShows[];
  play: plays;
  session: any;
  watchlist: watchlist[];
}

function PlayPage({ attendance, likedPlays, play, session, watchlist }: Props) {
  const sessionUser = session?.user;
  const playTitle = play.title;
  const title = `${playTitle} • StageKeeper`;

  return (
    <div>
      <Head>
        <title>{title}</title>
        <meta name="description" content="Created with NextJS" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Stack
        direction="row"
        sx={{ justifyContent: "center", marginTop: "2vh" }}
      >
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
            title={play.title}
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
            }}
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
            <Typography variant="h6">
              {`(${moment(play.premiere).format("YYYY")})`}
            </Typography>
          </Stack>
          <Stack direction="column" style={{ alignItems: "flex-start" }}>
            <Typography variant="subtitle1">
              Written by {play.writtenBy}
            </Typography>
          </Stack>
        </Stack>
        <Stack width="15%">
          <ShowActionBar
            attendance={attendance}
            likedShows={likedPlays}
            play={play}
            sessionUser={sessionUser}
            watchlist={watchlist}
          />
        </Stack>
      </Stack>
      <PerformanceCalendar
        viewType="show"
        identifier={playTitle}
        showType="PLAY"
      />
    </div>
  );
}

export async function getServerSideProps(context: {
  params: Params;
  req: any;
}) {
  const { title } = context.params;
  const [session, play] = await Promise.all([
    getSession({ req: context.req }),
    getPlayByTitle(title),
  ]);

  if (session) {
    const userId = Number(session.user.id);
    const [attendance, likedPlays, watchlist] = await Promise.all([
      getUserAttendance(userId),
      getLikedPlays(userId),
      getWatchlist(userId),
    ]);

    return {
      props: superjson.serialize({
        attendance,
        likedPlays,
        play,
        session,
        watchlist,
      }).json,
    };
  }

  return {
    props: superjson.serialize({
      play,
      session,
    }).json,
  };
}

export default PlayPage;
