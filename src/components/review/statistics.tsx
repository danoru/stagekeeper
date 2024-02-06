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

  // Musical Year Comparisons

  const firstMusical = stats.reduce((a, b) => (a.date < b.date ? a : b));

  const latestMusical = stats.reduce((a, b) => (a.date > b.date ? a : b));

  const oldestMusical = stats.reduce((a, b) =>
    a.premiere < b.premiere ? a : b
  );

  const newestMusical = stats.reduce((a, b) =>
    a.premiere > b.premiere ? a : b
  );

  // Locations Visited Calculations

  const locationOccurence: Record<string, number> = {};

  stats.forEach((stats: MUSICAL_LIST_TYPE) => {
    if (!locationOccurence[stats.location]) {
      locationOccurence[stats.location] = 1;
    } else {
      locationOccurence[stats.location]++;
    }
  });

  const mostVisitedLocation = Object.keys(locationOccurence).reduce((a, b) => {
    return locationOccurence[a] > locationOccurence[b] ? a : b;
  });

  const numberOfLocations = Object.keys(locationOccurence).length;

  // Musical Taste Calculations

  const musicalPremieres = stats.map((data) => moment(data.premiere).year());
  const musicalPremiereSum = musicalPremieres.reduce((a, b) => a + b, 0);
  const musicalPremiereAverage = Math.round(
    musicalPremiereSum / musicalPremieres.length
  );

  const currentDate = new Date();
  let currentYear = currentDate.getFullYear();

  const musicalPremiereAverageAge = currentYear - musicalPremiereAverage;

  function musicalTaste() {
    if (musicalPremiereAverageAge <= 20) {
      return "New School";
    } else {
      return "Old School";
    }
  }

  function musicalTasteDescription() {
    if (musicalPremiereAverageAge <= 20) {
      return "This is new school.";
    } else {
      return "This is old school.";
    }
  }

  // Musical Visits by Month

  const musicalMonths = stats.map((data) => moment(data.date).format("MMMM"));

  const monthlyOccurence: Record<string, number> = {};

  musicalMonths.forEach((month) => {
    if (!monthlyOccurence[month]) {
      monthlyOccurence[month] = 1;
    } else {
      monthlyOccurence[month]++;
    }
  });

  const mostVisitsPerMonth = Object.keys(monthlyOccurence).reduce((a, b) => {
    return monthlyOccurence[a] > monthlyOccurence[b] ? a : b;
  });

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
            <img
              src={firstMusical.playbill}
              width="58.44%"
              height="89.29%"
              alt={firstMusical.title}
              style={{
                borderRadius: "5%",
                display: "block",
              }}
            />
          </div>
          {/* <div className={styles.bannerRight}>
            <img
              src={firstMusical.banner}
              alt={firstMusical.title}
              width="75%"
              height="100%"
              style={{
                borderRadius: "5%",
                display: "block",
              }}
            />
          </div> */}
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
            <img
              src={latestMusical.playbill}
              width="58.44%"
              height="68.81%"
              alt={latestMusical.title}
              style={{
                borderRadius: "5%",
                display: "block",
              }}
            />
          </div>
          {/* <div className={styles.bannerLeft}>
            <img
              src={latestMusical.banner}
              width="93.75%"
              height="100%"
              alt={latestMusical.title}
              style={{
                borderRadius: "5%",
                display: "block",
              }}
            />
          </div> */}
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
            <img
              src={oldestMusical.playbill}
              width="58.44%"
              height="89.29%"
              alt={oldestMusical.title}
              style={{
                borderRadius: "5%",
                display: "block",
              }}
            />
          </div>
          {/* <div className={styles.bannerRight}>
            <img
              src={oldestMusical.banner}
              width="75%"
              height="100%"
              alt={oldestMusical.title}
              style={{
                borderRadius: "5%",
                display: "block",
              }}
            />
          </div> */}
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
            <img
              src={newestMusical.playbill}
              width="58.44%"
              height="68.81%"
              alt={newestMusical.title}
              style={{
                borderRadius: "5%",
                display: "block",
              }}
            />
          </div>
          {/* <div className={styles.bannerLeft}>
            <img
              src={newestMusical.banner}
              width="93.75%"
              height="100%"
              alt={newestMusical.title}
              style={{
                borderRadius: "5%",
                display: "block",
              }}
            />
          </div> */}
        </div>
        <div className={styles.centeredContent}>
          <MusicalByPremiereChart stats={stats} />
          <h1>Your musical taste is primarily ... {musicalTaste()}!</h1>
          <p>
            {musicalTasteDescription()} The average premiere date of the
            musicals you have seen is {musicalPremiereAverage}. That means your
            average musical age is {musicalPremiereAverageAge}!
          </p>
        </div>
      </section>
      <section>
        <div className={styles.centeredContent}>
          <LocationsChart stats={stats} />
          <h1>You visited {mostVisitedLocation} the most!</h1>
          <p>
            You attended {numberOfLocations} different cities during the year,
            but visited {mostVisitedLocation} the most.{" "}
          </p>
        </div>
        <div className={styles.centeredContent}>
          <MonthlyAttendanceChart stats={stats} />
          <h1>
            You visited the theatre the most during ... {mostVisitsPerMonth}!
          </h1>
          <p>Stuff about when you went throughout the year.</p>
        </div>
      </section>
    </div>
  );
}

export default Statistics;
