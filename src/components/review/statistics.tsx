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
                display: "block",
              }}
            />
          </div>
        </div>
      </section>
      {/* <section>
        <Card sx={{ display: "inline-block" }}>
          <Image
            src="/images/places/costamesa.jpg"
            width="100"
            height="100"
            alt="costa mesa"
          />
          <h1>Your spent the most time in ... Costa Mesa!</h1>
          <p> Stuff about the places you have been. </p>
        </Card>
        <Card sx={{ display: "inline-block" }}>
          <Image
            src="/images/places/segerstrom.jpg"
            width="100"
            height="100"
            alt="Segerstrom Center for the Arts"
          />
          <h1>
            Your most visited playhouse was ... Segerstrom Center for the Arts!
          </h1>
          <p>Stuff about the playhouses you went to.</p>
        </Card>
      </section> */}
      <section>
        <div className={styles.container}>
          <div className={styles.infoboxRight}>
            <h1>Last Musical of the Year ... {latestMusical.title}!</h1>
            <p>
              You watched {latestMusical.title} at the {latestMusical.playhouse}{" "}
              in {latestMusical.location} on {latestMusical.date}!
            </p>
          </div>
          <div className={styles.playbillRight}>
            <Image
              src={latestMusical.playbill}
              width="187"
              height="300"
              alt={latestMusical.title}
              style={{
                display: "block",
              }}
            />
          </div>
          <div className={styles.bannerRight}>
            <Image
              src={latestMusical.banner}
              width="600"
              height="400"
              alt={latestMusical.title}
              style={{
                display: "block",
              }}
            />
          </div>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(12, 1fr)",
            marginBottom: "3%",
            position: "relative",
          }}
        >
          <div
            style={{
              gridColumn: "7 / span 6",
              gridRow: "1",
              paddingTop: "15%",
            }}
          >
            <h1>Last Musical of the Year ... {latestMusical.title}!</h1>
            <p>
              You watched {latestMusical.title} at the {latestMusical.playhouse}{" "}
              in {latestMusical.location} on {latestMusical.date}!
            </p>
          </div>
          <div
            style={{
              borderRadius: "5%",
              gridColumn: "5 / span 2",
              gridRow: "1",
              paddingTop: "20%",
              zIndex: 1,
            }}
          >
            <Image
              src={latestMusical.playbill}
              width="187"
              height="300"
              alt={latestMusical.title}
              style={{
                display: "block",
              }}
            />
          </div>
          <div
            style={{
              borderRadius: "5%",
              gridColumn: "1 / span 7",
              gridRow: "1",
            }}
          >
            <Image
              src={latestMusical.banner}
              width="600"
              height="400"
              alt={latestMusical.title}
              style={{
                display: "block",
              }}
            />
          </div>
        </div>
        <Card sx={{ display: "inline-block" }}>
          <Image
            src={oldestMusical.playbill}
            width="100"
            height="100"
            alt={oldestMusical.title}
          />
          <h1>The oldest musical you saw was ... {oldestMusical.title}</h1>
          <p>Stuff about the playhouses you went to.</p>
        </Card>
        <Card sx={{ display: "inline-block" }}>
          <Image
            src={newestMusical.playbill}
            width="100"
            height="100"
            alt={newestMusical.title}
          />
          <h1>The newest musical you saw was ... {newestMusical.title}</h1>
          <p>Stuff about the playhouses you went to.</p>
        </Card>
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
