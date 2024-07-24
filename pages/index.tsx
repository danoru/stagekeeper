import Head from "next/head";
import LoggedInHomePage from "../src/components/home/LoggedInHomePage";
import LoggedOutHomePage from "../src/components/home/LoggedOutHomePage";
import superjson from "superjson";
import { getFollowing } from "../src/data/users";
import { getFriendsUpcomingPerformances } from "../src/data/performances";
import { GetServerSidePropsContext } from "next";
import { getSession } from "next-auth/react";
import styles from "../src/styles/home.module.css";

interface Props {
  session: any;
  upcomingPerformances: any;
}

function Home({ session, upcomingPerformances }: Props) {
  const sessionUser = session?.user.username;

  return (
    <div className={styles.container}>
      <Head>
        <title>StageKeeper</title>
        <meta name="description" content="Created with NextJS" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {session ? (
        <LoggedInHomePage
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
    const [upcomingPerformances] = await Promise.all([
      getFriendsUpcomingPerformances(followingList),
    ]);

    return {
      props: superjson.serialize({ session, upcomingPerformances }).json,
    };
  }
  return {
    props: { session },
  };
}

export default Home;
