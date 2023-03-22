import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";

import styles from "../src/styles/home.module.css";

function Home() {
  return (
    <div className={styles.container}>
      <Head>
        <title>StageKeeper</title>
        <meta name="description" content="Created with NextJS" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={styles.main}>
        <div className={styles.heroContainer}>
          <div className={styles.title}>
            <h1>Welcome to StageKeeper!</h1>
          </div>
          <Image
            className={styles.heroImage}
            src="/images/broadway.jpg"
            fill
            alt="Broadway"
          />
          <div className={styles.heroDescription}>
            <h2>Find out what shows are on a stage near you.</h2>
            <h2>Schedule with your friends what shows you want to see. </h2>
            <h2>Keep track of what performances you have seen.</h2>
          </div>
        </div>
        <p className={styles.description}>
          StageKeeper is your hub for all things musical theatre.
        </p>
        {/* <div className={styles.grid}>
          <a href="https://nextjs.org/docs" className={styles.card}>
            <h2>Documentation &rarr;</h2>
            <p>Find in-depth information about Next.js features and API.</p>
          </a>

          <a href="https://nextjs.org/learn" className={styles.card}>
            <h2>Learn &rarr;</h2>
            <p>Learn about Next.js in an interactive course with quizzes!</p>
          </a>

          <a
            href="https://github.com/vercel/next.js/tree/master/examples"
            className={styles.card}
          >
            <h2>Examples &rarr;</h2>
            <p>Discover and deploy boilerplate example Next.js projects.</p>
          </a>

          <a
            href="https://vercel.com/new?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
            className={styles.card}
          >
            <h2>Deploy &rarr;</h2>
            <p>
              Instantly deploy your Next.js site to a public URL with Vercel.
            </p>
          </a>
        </div> */}
      </main>
    </div>
  );
}

export default Home;
