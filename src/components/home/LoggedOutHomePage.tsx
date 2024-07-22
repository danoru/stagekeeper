import Image from "next/image";
import styles from "../../styles/home.module.css";

function LoggedOutHomePage() {
  return (
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
  );
}

export default LoggedOutHomePage;
