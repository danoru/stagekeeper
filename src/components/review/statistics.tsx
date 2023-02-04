import { MUSICAL_LIST_TYPE } from "../../types";

import Card from "@mui/material/Card";
import Image from "next/image";

import styles from "../../styles/statistics.module.css";

interface Props {
  stats: MUSICAL_LIST_TYPE[];
}

function Statistics(props: Props) {
  const { stats } = props;

  const filteredMusicals = stats.filter(
    (stats: MUSICAL_LIST_TYPE) => stats.groupAttended
  );

  const firstMusical = filteredMusicals.reduce((a, b) =>
    a.date < b.date ? a : b
  );

  const latestMusical = filteredMusicals.reduce((a, b) =>
    a.date > b.date ? a : b
  );

  const oldestMusical = filteredMusicals.reduce((a, b) =>
    a.premiere < b.premiere ? a : b
  );

  const newestMusical = filteredMusicals.reduce((a, b) =>
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
              in {firstMusical.location} on {firstMusical.date}!
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
              width="600"
              height="400"
              alt={firstMusical.title}
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
              in {latestMusical.location} on {latestMusical.date}!
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
            <h1>Last Musical of the Year ... {oldestMusical.title}!</h1>
            <p>
              You watched {oldestMusical.title} at the {oldestMusical.playhouse}{" "}
              in {oldestMusical.location} on {oldestMusical.date}!
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
          <div className={styles.infoBoxLeft}>
            <h1>Last Musical of the Year ... {newestMusical.title}!</h1>
            <p>
              You watched {newestMusical.title} at the {newestMusical.playhouse}{" "}
              in {newestMusical.location} on {newestMusical.date}!
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
        <Card sx={{ display: "inline-block" }}>
          <Image
            src={newestMusical.playbill}
            width="100"
            height="100"
            alt="costa mesa"
          />
          <h1>Your musical taste is primarily ... New School!</h1>
          <p>Stuff about the playhouses you went to.</p>
        </Card>
      </section>
    </div>
  );
}

export default Statistics;
