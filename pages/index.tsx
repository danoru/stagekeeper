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
            priority
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
      </main>
    </div>
  );
}

export default Home;
