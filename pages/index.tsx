import Head from "next/head";
import Image from "next/image";
import LoggedInHomePage from "../src/components/home/LoggedInHomePage";
import LoggedOutHomePage from "../src/components/home/LoggedOutHomePage";
import styles from "../src/styles/home.module.css";
import { GetServerSidePropsContext } from "next";
import { getSession } from "next-auth/react";

interface Props {
  session: any;
}

function Home({ session }: Props) {
  const sessionUser = session?.user.username;

  return (
    <div className={styles.container}>
      <Head>
        <title>StageKeeper</title>
        <meta name="description" content="Created with NextJS" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {session ? (
        <LoggedInHomePage sessionUser={sessionUser} />
      ) : (
        <LoggedOutHomePage />
      )}
    </div>
  );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const session = await getSession(context);

  if (session) {
    return {
      props: { session },
    };
  }
  return;
}

export default Home;
