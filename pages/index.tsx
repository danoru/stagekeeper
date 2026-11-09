import { GetServerSidePropsContext } from "next";
import Head from "next/head";
import superjson from "superjson";

import LoggedInHomePage from "../src/components/home/LoggedInHomePage";
import LoggedOutHomePage from "../src/components/home/LoggedOutHomePage";
import { getStageBoard } from "../src/data/board";
import prisma from "../src/data/db";
import { getHomeTheatres } from "../src/data/homeTheatres";
import {
  getFriendsUpcomingPerformances,
  getRecentPerformances,
  getUserUpcoming,
} from "../src/data/performances";
import { getFollowedGoingVisibleIds } from "../src/data/privacy";
import styles from "../src/styles/home.module.css";
import type { HomeTheatreCard } from "../src/utils/homeTheatres";
import type { StageBoard } from "../src/utils/stageBoard";
import { getViewerSession } from "../src/utils/viewer";

interface Props {
  board: StageBoard | null;
  homeTheatres: HomeTheatreCard[];
  myUpcoming: any;
  recentPerformances: any;
  session: any;
  upcomingPerformances: any;
}

function Home({
  board,
  homeTheatres,
  myUpcoming,
  recentPerformances,
  session,
  upcomingPerformances,
}: Props) {
  const sessionUser = session?.user.username;

  return (
    <div className={styles.container}>
      <Head>
        <title>StageKeeper</title>
        <link href="/favicon.ico" rel="icon" />
      </Head>
      {session ? (
        <LoggedInHomePage
          board={board}
          homeTheatres={homeTheatres}
          myUpcoming={myUpcoming}
          recentPerformances={recentPerformances}
          sessionUser={sessionUser}
          upcomingPerformances={upcomingPerformances}
        />
      ) : (
        <LoggedOutHomePage board={board} />
      )}
    </div>
  );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const session = await getViewerSession(context);

  if (session) {
    const userId = Number(session.user.id);
    const username = session.user.username;

    // Brand-new accounts with nothing logged get walked through onboarding first.
    const me = await prisma.users.findUnique({
      where: { id: userId },
      select: { onboardedAt: true, _count: { select: { attendance: true } } },
    });
    if (me && !me.onboardedAt && me._count.attendance === 0) {
      return { redirect: { destination: "/welcome", permanent: false } };
    }

    // Going dates are only shared with mutual follows and groupmates.
    const friendIds = await getFollowedGoingVisibleIds(userId);

    const [recentPerformances, upcomingPerformances, myUpcoming, board, homeTheatres] =
      await Promise.all([
        getRecentPerformances([username], userId),
        getFriendsUpcomingPerformances(friendIds, userId),
        getUserUpcoming(userId, userId),
        getStageBoard({ viewerId: userId }),
        getHomeTheatres(userId),
      ]);

    return {
      props: superjson.serialize({
        board,
        homeTheatres,
        recentPerformances,
        session,
        upcomingPerformances,
        myUpcoming,
      }).json,
    };
  }
  // The landing page should still open if the database can't be reached.
  const board = await getStageBoard().catch(() => null);
  return {
    props: { board, homeTheatres: [], session },
  };
}

export default Home;
