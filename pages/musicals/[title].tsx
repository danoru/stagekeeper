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
  musicals,
  performances,
  watchlist,
} from "@prisma/client";
import {
  getLikedMusicals,
  getMusicalByTitle,
  getWatchlist,
} from "../../src/data/musicals";
import { getSession } from "next-auth/react";
import { getUserAttendance } from "../../src/data/performances";

interface Params {
  title: string;
}

interface Props {
  attendance: (attendance & { performances: performances })[];
  likedMusicals: likedShows[];
  musical: musicals;
  session: any;
  watchlist: watchlist[];
}

function MusicalPage({
  attendance,
  likedMusicals,
  musical,
  session,
  watchlist,
}: Props) {
  const sessionUser = session?.user;
  const title = `${musical.title} • StageKeeper`;
  const musicalTitle = musical.title;

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
            image={musical.playbill}
            title={musical.title}
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
            <Typography variant="h6">{musical.title}</Typography>
            <Typography variant="h6">
              {`(${moment(musical.premiere).format("YYYY")})`}
            </Typography>
          </Stack>
          <Stack direction="column" style={{ alignItems: "flex-start" }}>
            <Typography variant="subtitle1">
              Music by {musical.musicBy}
            </Typography>
            <Typography variant="subtitle1">
              Lyrics by {musical.lyricsBy}
            </Typography>
            <Typography variant="subtitle1">
              Book by {musical.bookBy}
            </Typography>
          </Stack>
        </Stack>
        <Stack width="15%">
          <ShowActionBar
            attendance={attendance}
            likedShows={likedMusicals}
            musical={musical}
            sessionUser={sessionUser}
            watchlist={watchlist}
          />
        </Stack>
      </Stack>
      <PerformanceCalendar
        viewType="show"
        identifier={musicalTitle}
        showType="MUSICAL"
      />
    </div>
  );
}

export async function getServerSideProps(context: {
  params: Params;
  req: any;
}) {
  const { title } = context.params;
  const [session, musical] = await Promise.all([
    getSession({ req: context.req }),
    getMusicalByTitle(title),
  ]);

  if (session) {
    const userId = Number(session.user.id);
    const [attendance, likedMusicals, watchlist] = await Promise.all([
      getUserAttendance(userId),
      getLikedMusicals(userId),
      getWatchlist(userId),
    ]);

    return {
      props: superjson.serialize({
        attendance,
        likedMusicals,
        musical,
        session,
        watchlist,
      }).json,
    };
  }

  return {
    props: superjson.serialize({
      musical,
      session,
    }).json,
  };
}

export default MusicalPage;
