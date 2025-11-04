import { GetServerSidePropsContext } from "next";
import Head from "next/head";
import { getSession } from "next-auth/react";
import superjson from "superjson";

import LoggedInHomePage from "../src/components/home/LoggedInHomePage";
import LoggedOutHomePage from "../src/components/home/LoggedOutHomePage";
import prisma from "../src/data/db";
import styles from "../src/styles/home.module.css";

interface Props {
  recentPerformances: any;
  session: any;
  upcomingPerformances: any;
}

function Home({ recentPerformances, session, upcomingPerformances }: Props) {
  const sessionUser = session?.user.username;

  return (
    <div className={styles.container}>
      <Head>
        <title>StageKeeper</title>
        <meta content="Created with NextJS" name="description" />
        <link href="/favicon.ico" rel="icon" />
      </Head>
      {session ? (
        <LoggedInHomePage
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
    const userData = await prisma.users.findUnique({
      where: { id: userId },
      include: {
        following: {
          include: {
            users: true,
          },
        },
        attendance: {
          include: {
            performances: {
              include: { musicals: true, plays: true, theatres: true },
            },
          },
          orderBy: { performances: { startTime: "desc" } },
          take: 20,
        },
      },
    });

    const followingList = userData?.following.map(
      (user: { followingUsername: string }) => user.followingUsername
    );
    const upcomingPerformances = await prisma.attendance.findMany({
      where: {
        users: { username: { in: followingList } },
        performances: { startTime: { gte: new Date() } },
      },
      include: {
        performances: { include: { musicals: true, plays: true, theatres: true } },
      },
      take: 20,
    });

    return {
      props: superjson.serialize({
        recentPerformances: userData?.attendance,
        session,
        upcomingPerformances,
      }).json,
    };
  }
  return {
    props: { session },
  };
}

export default Home;
