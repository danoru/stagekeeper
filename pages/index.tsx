import { GetServerSidePropsContext } from "next";
import Head from "next/head";
import { getSession } from "next-auth/react";
import superjson from "superjson";

import LoggedInHomePage from "../src/components/home/LoggedInHomePage";
import LoggedOutHomePage from "../src/components/home/LoggedOutHomePage";
import { getRecentPerformances, getFriendsUpcomingPerformances } from "../src/data/performances";
import { getFollowing } from "../src/data/users";
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
    const following = await getFollowing(userId);
    const followingList = following.map((user) => user.followingUsername);
    const [upcomingPerformances, recentPerformances] = await Promise.all([
      getFriendsUpcomingPerformances(followingList),
      getRecentPerformances(followingList),
    ]);

    return {
      props: superjson.serialize({
        recentPerformances,
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
