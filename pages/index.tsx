import { GetServerSidePropsContext } from "next";
import Head from "next/head";
import { getSession } from "next-auth/react";
import superjson from "superjson";

import LoggedInHomePage from "../src/components/home/LoggedInHomePage";
import LoggedOutHomePage from "../src/components/home/LoggedOutHomePage";
import prisma from "../src/data/db";
import {
  getFriendsUpcomingPerformances,
  getRecentPerformances,
  getUserUpcoming,
} from "../src/data/performances";
import styles from "../src/styles/home.module.css";

interface Props {
  myUpcoming: any;
  recentPerformances: any;
  session: any;
  upcomingPerformances: any;
}

function Home({ myUpcoming, recentPerformances, session, upcomingPerformances }: Props) {
  const sessionUser = session?.user.username;

  return (
    <div className={styles.container}>
      <Head>
        <title>StageKeeper</title>
        <link href="/favicon.ico" rel="icon" />
      </Head>
      {session ? (
        <LoggedInHomePage
          myUpcoming={myUpcoming}
          recentPerformances={recentPerformances}
          sessionUser={sessionUser}
          upcomingPerformances={upcomingPerformances}
        />
      ) : (
        <LoggedOutHomePage />
      )}
    </div>
  );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const session = await getSession(context);

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

    const following = await prisma.following.findMany({
      where: { user: userId },
      select: { followingUsername: true },
    });
    const followingList = following.map((f) => f.followingUsername);

    const [recentPerformances, upcomingPerformances, myUpcoming] = await Promise.all([
      getRecentPerformances([username]),
      getFriendsUpcomingPerformances(followingList),
      getUserUpcoming(userId),
    ]);

    return {
      props: superjson.serialize({
        recentPerformances,
        session,
        upcomingPerformances,
        myUpcoming,
      }).json,
    };
  }
  return {
    props: { session },
  };
}

export default Home;
