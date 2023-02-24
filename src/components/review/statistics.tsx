import Image from "next/image";
import moment from "moment";

import MusicalByPremiereChart from "./musical-by-premiere";
import MonthlyAttendanceChart from "./monthly-attendance";
import LocationsChart from "./locations-chart";

import { MUSICAL_LIST_TYPE } from "../../types";
import styles from "../../styles/statistics.module.css";

interface Props {
  stats: MUSICAL_LIST_TYPE[];
}

function Statistics(props: Props) {
  const { stats } = props;

  const firstMusical = stats.reduce((a, b) => (a.date < b.date ? a : b));

  const latestMusical = stats.reduce((a, b) => (a.date > b.date ? a : b));

  const oldestMusical = stats.reduce((a, b) =>
    a.premiere < b.premiere ? a : b
  );

  const newestMusical = stats.reduce((a, b) =>
    a.premiere > b.premiere ? a : b
  );

  return (
    <div>
      <section>
        <div className={styles.container}>
          <div className={styles.infoboxRight}>
            <h1>First Musical of the Year ... {firstMusical.title}!</h1>
            <p>
              You watched {firstMusical.title} at the {firstMusical.playhouse}{" "}
              in {firstMusical.location} on{" "}
              {moment(firstMusical.date).format("MMMM Do, YYYY")}!
            </p>
          </div>
          <div className={styles.playbillRight}>
            <Image
              src={firstMusical.playbill}
              width="187"
              height="300"
              alt={firstMusical.title}
              style={{
                borderRadius: "5%",
                display: "block",
              }}
            />
          </div>
          <div className={styles.bannerRight}>
            <Image
              src={firstMusical.banner}
              alt={firstMusical.title}
              width="600"
              height="400"
              style={{
                borderRadius: "5%",
                display: "block",
              }}
            />
          </div>
        </div>
        <div className={styles.container}>
          <div className={styles.infoboxLeft}>
            <h1>Last Musical of the Year ... {latestMusical.title}!</h1>
            <p>
              You watched {latestMusical.title} at the {latestMusical.playhouse}{" "}
              in {latestMusical.location} on{" "}
              {moment(latestMusical.date).format("MMMM Do, YYYY")}!
            </p>
          </div>
          <div className={styles.playbillLeft}>
            <Image
              src={latestMusical.playbill}
              width="187"
              height="300"
              alt={latestMusical.title}
              style={{
                borderRadius: "5%",
                display: "block",
              }}
            />
          </div>
          <div className={styles.bannerLeft}>
            <Image
              src={latestMusical.banner}
              width="600"
              height="400"
              alt={latestMusical.title}
              style={{
                borderRadius: "5%",
                display: "block",
              }}
            />
          </div>
        </div>
      </section>
      <section>
        <div className={styles.container}>
          <div className={styles.infoboxRight}>
            <h1>Oldest Musical of the Year ... {oldestMusical.title}!</h1>
            <p>
              You watched {oldestMusical.title} at the {oldestMusical.playhouse}{" "}
              in {oldestMusical.location} on{" "}
              {moment(oldestMusical.date).format("MMMM Do, YYYY")}!
            </p>
          </div>
          <div className={styles.playbillRight}>
            <Image
              src={oldestMusical.playbill}
              width="187"
              height="300"
              alt={oldestMusical.title}
              style={{
                borderRadius: "5%",
                display: "block",
              }}
            />
          </div>
          <div className={styles.bannerRight}>
            <Image
              src={oldestMusical.banner}
              width="600"
              height="400"
              alt={oldestMusical.title}
              style={{
                borderRadius: "5%",
                display: "block",
              }}
            />
          </div>
        </div>
        <div className={styles.container}>
          <div className={styles.infoboxLeft}>
            <h1>Newest Musical of the Year ... {newestMusical.title}!</h1>
            <p>
              You watched {newestMusical.title} at the {newestMusical.playhouse}{" "}
              in {newestMusical.location} on{" "}
              {moment(newestMusical.date).format("MMMM Do, YYYY")}!
            </p>
          </div>
          <div className={styles.playbillLeft}>
            <Image
              src={newestMusical.playbill}
              width="187"
              height="300"
              alt={newestMusical.title}
              style={{
                borderRadius: "5%",
                display: "block",
              }}
            />
          </div>
          <div className={styles.bannerLeft}>
            <Image
              src={newestMusical.banner}
              width="600"
              height="400"
              alt={newestMusical.title}
              style={{
                borderRadius: "5%",
                display: "block",
              }}
            />
          </div>
        </div>
        <div className={styles.centeredContent}>
          <MusicalByPremiereChart stats={stats} />
          <h1>Your musical taste is primarily ... New School!</h1>
          <p>Stuff about the musicals you listen to.</p>
        </div>
      </section>
      <section>
        <div className={styles.centeredContent}>
          <LocationsChart stats={stats} />
          <h1>You visited the theatre the most during ... February!</h1>
          <p>Stuff about when you went throughout the year.</p>
        </div>
        <div className={styles.centeredContent}>
          <MonthlyAttendanceChart stats={stats} />
          <h1>You visited the theatre the most during ... February!</h1>
          <p>Stuff about when you went throughout the year.</p>
        </div>
      </section>
    </div>
  );
}

export default Statistics;
