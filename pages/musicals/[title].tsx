import { Box, Card, CardMedia, Stack, Typography } from "@mui/material";
import { musicals, performances, theatres } from "@prisma/client";
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
import { getMusicalByTitle } from "../../src/data/musicals";
import { getShowProductions, type ShowProduction } from "../../src/data/people";
import { canViewPending } from "../../src/data/visibility";
import { showPath } from "../../src/utils/slug";
import { getViewer } from "../../src/utils/viewer";

interface Props {
  musical: musicals;
  pastPerformances: (performances & { theatres: theatres })[];
  productions: ShowProduction[];
}

function MusicalPage({ musical, pastPerformances, productions }: Props) {
  const { data: session } = useSession();
  const sessionUser = session?.user;
  const viewerId = sessionUser?.id;
  const isAdmin = session?.user.badge === "ADMIN";
  const musicalTitle = musical.title;
  const credits = [
    musical.musicBy && `music by ${musical.musicBy}`,
    musical.lyricsBy && `lyrics by ${musical.lyricsBy}`,
    musical.bookBy && `book by ${musical.bookBy}`,
  ].filter(Boolean);
  const description = `${musical.title}${credits.length ? `, ${credits.join(", ")}` : ""}. Log it, rate it and see upcoming performances on StageKeeper.`;

  const [userStatus, setUserStatus] = useState<{
    attendance: any[];
    likedShows: any[];
    watchlist: any[];
  } | null>(null);
  // Bumped after any log/like/watchlist action so the action bar reflects it immediately.
  const [statusVersion, setStatusVersion] = useState(0);

  useEffect(() => {
    if (viewerId) {
      fetch(`/api/shows/user-status?musicalId=${musical.id}`)
        .then((r) => r.json())
        .then(setUserStatus);
    }
  }, [viewerId, musical.id, statusVersion]);

  return (
    <div>
      <PageMeta
        description={description}
        path={showPath("musicals", musical.title)}
        title={musical.title}
      />
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
            <Typography component="h1" variant="h6">
              {musical.title}
            </Typography>
            {musical.premiere && (
              <Typography variant="h6">{`(${moment.utc(musical.premiere).format("YYYY")})`}</Typography>
            )}
          </Stack>
          <Stack direction="column" sx={{ alignItems: "inherit" }}>
            {musical.musicBy && (
              <Typography variant="subtitle1">Music by {musical.musicBy}</Typography>
            )}
            {musical.lyricsBy && (
              <Typography variant="subtitle1">Lyrics by {musical.lyricsBy}</Typography>
            )}
            {musical.bookBy && (
              <Typography variant="subtitle1">Book by {musical.bookBy}</Typography>
            )}
            {musical.status === "PENDING" && <PendingNotice />}
          </Stack>
        </Stack>
        <Stack sx={{ width: { xs: "100%", sm: "260px", md: "15%" }, maxWidth: "100%" }}>
          <ShowActionBar
            attendance={userStatus?.attendance ?? []}
            likedShows={userStatus?.likedShows ?? []}
            musical={musical}
            pastPerformances={pastPerformances}
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
      <ShowCommunity musicalId={musical.id} version={statusVersion} />
      <Productions
        canSuggest={isAdmin || pastVisits((userStatus?.attendance ?? []) as Visit[]).length > 0}
        isAdmin={isAdmin}
        loggedIn={!!session}
        productions={productions}
        showKey={`MUSICAL-${musical.id}`}
        showTitle={musical.title}
        visits={(userStatus?.attendance ?? []) as Visit[]}
      />
      <PerformanceCalendar identifier={musicalTitle} showType="MUSICAL" viewType="show" />
      <ReportButton targetId={musical.id} targetType="MUSICAL" />
    </div>
  );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const musical = await getMusicalByTitle(String(context.params?.title));

  if (!musical) {
    return { notFound: true };
  }

  // Pending shows are checked per viewer and never cached; approved ones are the same for
  // everyone, so the CDN can hold them for a few minutes.
  if (musical.status === "PENDING") {
    const viewer = await getViewer(context);
    if (!(await canViewPending({ musical: musical.id }, musical.createdBy, viewer))) {
      return { notFound: true };
    }
    context.res.setHeader("Cache-Control", "private, no-store");
  } else {
    context.res.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=600");
  }

  const [pastPerformances, productions] = await Promise.all([
    prisma.performances.findMany({
      where: { musical: musical.id, startTime: { lte: new Date() }, status: { not: "CANCELED" } },
      include: { theatres: true },
      orderBy: { startTime: "desc" },
      take: 50,
    }),
    getShowProductions({ musical: musical.id }),
  ]);

  return {
    props: superjson.serialize({ musical, pastPerformances, productions }).json,
  };
}

export default MusicalPage;
