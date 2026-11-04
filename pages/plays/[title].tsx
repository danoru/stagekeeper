import { Box, Card, CardMedia, Stack, Typography } from "@mui/material";
import { performances, plays, theatres } from "@prisma/client";
import moment from "moment";
import { GetServerSidePropsContext } from "next";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import superjson from "superjson";

import PageMeta from "../../src/components/layout/PageMeta";
import Productions from "../../src/components/people/Productions";
import PerformanceCalendar from "../../src/components/schedule/PerformanceCalendar";
import PendingNotice from "../../src/components/shows/PendingNotice";
import ReportButton from "../../src/components/shows/ReportButton";
import ShowActionBar from "../../src/components/shows/ShowActionBar";
import ShowCommunity from "../../src/components/shows/ShowCommunity";
import YourVisits, { pastVisits, type Visit } from "../../src/components/shows/YourVisits";
import prisma from "../../src/data/db";
import { getShowProductions, type ShowProduction } from "../../src/data/people";
import { getPlayByTitle } from "../../src/data/plays";
import { canViewPending } from "../../src/data/visibility";
import { showPath } from "../../src/utils/slug";
import { getViewer } from "../../src/utils/viewer";

interface Props {
  play: plays;
  pastPerformances: (performances & { theatres: theatres })[];
  productions: ShowProduction[];
}

function PlayPage({ play, pastPerformances, productions }: Props) {
  const { data: session } = useSession();
  const sessionUser = session?.user;
  const viewerId = sessionUser?.id;
  const isAdmin = session?.user.badge === "ADMIN";
  const playTitle = play.title;
  const description = `${play.title}${play.writtenBy ? `, written by ${play.writtenBy}` : ""}. Log it, rate it and see upcoming performances on StageKeeper.`;

  const [userStatus, setUserStatus] = useState<{
    attendance: any[];
    likedShows: any[];
    watchlist: any[];
  } | null>(null);
  // Bumped after any log/like/watchlist action so the action bar reflects it immediately.
  const [statusVersion, setStatusVersion] = useState(0);

  useEffect(() => {
    if (viewerId) {
      fetch(`/api/shows/user-status?playId=${play.id}`)
        .then((r) => r.json())
        .then(setUserStatus);
    }
  }, [viewerId, play.id, statusVersion]);

  return (
    <div>
      <PageMeta description={description} path={showPath("plays", play.title)} title={play.title} />
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
          sx={{
            alignItems: { xs: "center", md: "flex-start" },
            marginRight: { xs: 0, md: "2vw" },
            textAlign: { xs: "center", md: "left" },
            width: { xs: "100%", md: "50%" },
          }}
        >
          <Stack direction="row" spacing={2} sx={{ flexWrap: "wrap", justifyContent: "inherit" }}>
            <Typography component="h1" variant="h6">
              {play.title}
            </Typography>
            {play.premiere && (
              <Typography variant="h6">{`(${moment.utc(play.premiere).format("YYYY")})`}</Typography>
            )}
          </Stack>
          <Stack direction="column" sx={{ alignItems: "inherit" }}>
            {play.writtenBy && (
              <Typography variant="subtitle1">Written by {play.writtenBy}</Typography>
            )}
            {play.status === "PENDING" && <PendingNotice />}
          </Stack>
        </Stack>
        <Stack sx={{ width: { xs: "100%", sm: "260px", md: "15%" }, maxWidth: "100%" }}>
          <ShowActionBar
            attendance={userStatus?.attendance ?? []}
            likedShows={userStatus?.likedShows ?? []}
            pastPerformances={pastPerformances}
            play={play}
            sessionUser={sessionUser}
            watchlist={userStatus?.watchlist ?? []}
            onStatusChange={() => setStatusVersion((v) => v + 1)}
          />
        </Stack>
      </Stack>
      {session && (
        <YourVisits
          visits={(userStatus?.attendance ?? []) as Visit[]}
          onChanged={() => setStatusVersion((v) => v + 1)}
        />
      )}
      <ShowCommunity playId={play.id} version={statusVersion} />
      <Productions
        canSuggest={isAdmin || pastVisits((userStatus?.attendance ?? []) as Visit[]).length > 0}
        isAdmin={isAdmin}
        loggedIn={!!session}
        productions={productions}
        showKey={`PLAY-${play.id}`}
        showTitle={play.title}
        visits={(userStatus?.attendance ?? []) as Visit[]}
      />
      <PerformanceCalendar identifier={playTitle} showType="PLAY" viewType="show" />
      <ReportButton targetId={play.id} targetType="PLAY" />
    </div>
  );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const play = await getPlayByTitle(String(context.params?.title));

  if (!play) {
    return { notFound: true };
  }

  // Pending shows are checked per viewer and never cached; approved ones are the same for
  // everyone, so the CDN can hold them for a few minutes.
  if (play.status === "PENDING") {
    const viewer = await getViewer(context);
    if (!(await canViewPending({ play: play.id }, play.createdBy, viewer))) {
      return { notFound: true };
    }
    context.res.setHeader("Cache-Control", "private, no-store");
  } else {
    context.res.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=600");
  }

  const [pastPerformances, productions] = await Promise.all([
    prisma.performances.findMany({
      where: { play: play.id, startTime: { lte: new Date() }, status: { not: "CANCELED" } },
      include: { theatres: true },
      orderBy: { startTime: "desc" },
      take: 50,
    }),
    getShowProductions({ play: play.id }),
  ]);

  return {
    props: superjson.serialize({ play, pastPerformances, productions }).json,
  };
}

export default PlayPage;
