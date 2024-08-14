import Image from "next/image";
import moment from "moment";
import MusicalByPremiereChart from "./MusicalByPremiere";
import MonthlyAttendanceChart from "./MonthlyAttendance";
import LocationsChart from "./LocationsChart";
import styles from "../../styles/statistics.module.css";
import { attendance, musicals, performances, theatres } from "@prisma/client";

interface Props {
  stats: (attendance & {
    performances: performances & { musicals: musicals; theatres: theatres };
  })[];
}

function Statistics({ stats }: Props) {
  // Musical Year Comparisons
  const hasData = stats.length > 0;

  const firstMusical = hasData
    ? stats.reduce((a, b) =>
        a.performances.startTime < b.performances.startTime ? a : b
      )
    : null;

  const latestMusical = hasData
    ? stats.reduce((a, b) =>
        a.performances.startTime > b.performances.startTime ? a : b
      )
    : null;

  const oldestMusical = hasData
    ? stats.reduce((a, b) => {
        const premiereA = a.performances.musicals?.premiere ?? new Date();
        const premiereB = b.performances.musicals?.premiere ?? new Date();
        return premiereA < premiereB ? a : b;
      })
    : null;

  const newestMusical = hasData
    ? stats.reduce((a, b) => {
        const premiereA =
          a.performances.musicals?.premiere ?? new Date("1066-09-12");
        const premiereB =
          b.performances.musicals?.premiere ?? new Date("1066-09-12");
        return premiereA > premiereB ? a : b;
      })
    : null;

  // Locations Visited Calculations
  const locationOccurrence: Record<string, number> = {};

  stats.forEach((stat) => {
    const location = stat.performances.theatres.location;
    if (!locationOccurrence[location]) {
      locationOccurrence[location] = 1;
    } else {
      locationOccurrence[location]++;
    }
  });

  const mostVisitedLocation =
    Object.keys(locationOccurrence).length > 0
      ? Object.keys(locationOccurrence).reduce((a, b) =>
          locationOccurrence[a] > locationOccurrence[b] ? a : b
        )
      : null;

  const numberOfLocations = Object.keys(locationOccurrence).length;

  // Musical Taste Calculations
  const musicalPremieres = stats
    .map((data) => moment(data.performances.musicals?.premiere).year())
    .filter((year) => year); // Filter out undefined or null years

  const musicalPremiereSum =
    musicalPremieres.length > 0
      ? musicalPremieres.reduce((a, b) => a + b, 0)
      : 0;

  const musicalPremiereAverage =
    musicalPremieres.length > 0
      ? Math.round(musicalPremiereSum / musicalPremieres.length)
      : 0;

  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();

  const musicalPremiereAverageAge = currentYear - musicalPremiereAverage;

  function musicalTaste() {
    return musicalPremiereAverageAge <= 20 ? "New School" : "Old School";
  }

  function musicalTasteDescription() {
    return musicalPremiereAverageAge <= 20
      ? "This is new school."
      : "This is old school.";
  }

  // Musical Visits by Month
  const musicalMonths = stats
    .map((data) => moment(data.performances.startTime).format("MMMM"))
    .filter((month) => month);

  const monthlyOccurrence: Record<string, number> = {};

  musicalMonths.forEach((month) => {
    if (!monthlyOccurrence[month]) {
      monthlyOccurrence[month] = 1;
    } else {
      monthlyOccurrence[month]++;
    }
  });

  const mostVisitsPerMonth =
    Object.keys(monthlyOccurrence).length > 0
      ? Object.keys(monthlyOccurrence).reduce((a, b) =>
          monthlyOccurrence[a] > monthlyOccurrence[b] ? a : b
        )
      : null;

  return (
    <div>
      <section>
        <div className={styles.container}>
          <div className={styles.infoboxRight}>
            <h1>
              First Musical of the Year ...{" "}
              {firstMusical ? firstMusical.performances.musicals?.title : "N/A"}
              !
            </h1>
            <p>
              You watched{" "}
              {firstMusical ? firstMusical.performances.musicals?.title : "N/A"}{" "}
              at the{" "}
              {firstMusical ? firstMusical.performances.theatres.name : "N/A"}{" "}
              in{" "}
              {firstMusical
                ? firstMusical.performances.theatres.location
                : "N/A"}{" "}
              on{" "}
              {firstMusical
                ? moment(firstMusical.performances.startTime).format(
                    "MMMM Do, YYYY"
                  )
                : "N/A"}
              !
            </p>
          </div>
          <div className={styles.playbillRight}>
            <Image
              src={
                firstMusical ? firstMusical.performances.musicals?.playbill : ""
              }
              width={210}
              height={280}
              alt={
                firstMusical ? firstMusical.performances.musicals?.title : "N/A"
              }
              style={{
                borderRadius: "5%",
                display: "block",
              }}
            />
          </div>
        </div>
        <div className={styles.container}>
          <div className={styles.infoboxLeft}>
            <h1>
              Last Musical of the Year ...{" "}
              {latestMusical
                ? latestMusical.performances.musicals?.title
                : "N/A"}
              !
            </h1>
            <p>
              You watched{" "}
              {latestMusical
                ? latestMusical.performances.musicals?.title
                : "N/A"}{" "}
              at the{" "}
              {latestMusical ? latestMusical.performances.theatres.name : "N/A"}{" "}
              in{" "}
              {latestMusical
                ? latestMusical.performances.theatres.location
                : "N/A"}{" "}
              on{" "}
              {latestMusical
                ? moment(latestMusical.performances.startTime).format(
                    "MMMM Do, YYYY"
                  )
                : "N/A"}
              !
            </p>
          </div>
          <div className={styles.playbillLeft}>
            <Image
              src={
                latestMusical
                  ? latestMusical.performances.musicals?.playbill
                  : ""
              }
              width={210}
              height={280}
              alt={
                latestMusical
                  ? latestMusical.performances.musicals?.title
                  : "N/A"
              }
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
            <h1>
              Oldest Musical of the Year ...{" "}
              {oldestMusical
                ? oldestMusical.performances.musicals?.title
                : "N/A"}
              !
            </h1>
            <p>
              You watched{" "}
              {oldestMusical
                ? oldestMusical.performances.musicals?.title
                : "N/A"}{" "}
              at the{" "}
              {oldestMusical ? oldestMusical.performances.theatres.name : "N/A"}{" "}
              in{" "}
              {oldestMusical
                ? oldestMusical.performances.theatres.location
                : "N/A"}{" "}
              on{" "}
              {oldestMusical
                ? moment(oldestMusical.performances.startTime).format(
                    "MMMM Do, YYYY"
                  )
                : "N/A"}
              !
            </p>
          </div>
          <div className={styles.playbillRight}>
            <Image
              src={
                oldestMusical
                  ? oldestMusical.performances.musicals?.playbill
                  : ""
              }
              width={210}
              height={280}
              alt={
                oldestMusical
                  ? oldestMusical.performances.musicals?.title
                  : "N/A"
              }
              style={{
                borderRadius: "5%",
                display: "block",
              }}
            />
          </div>
        </div>
        <div className={styles.container}>
          <div className={styles.infoboxLeft}>
            <h1>
              Newest Musical of the Year ...{" "}
              {newestMusical
                ? newestMusical.performances.musicals?.title
                : "N/A"}
              !
            </h1>
            <p>
              You watched{" "}
              {newestMusical
                ? newestMusical.performances.musicals?.title
                : "N/A"}{" "}
              at the{" "}
              {newestMusical ? newestMusical.performances.theatres.name : "N/A"}{" "}
              in{" "}
              {newestMusical
                ? newestMusical.performances.theatres.location
                : "N/A"}{" "}
              on{" "}
              {newestMusical
                ? moment(newestMusical.performances.startTime).format(
                    "MMMM Do, YYYY"
                  )
                : "N/A"}
              !
            </p>
          </div>
          <div className={styles.playbillLeft}>
            <Image
              src={
                newestMusical
                  ? newestMusical.performances.musicals?.playbill
                  : ""
              }
              width={210}
              height={280}
              alt={
                newestMusical
                  ? newestMusical.performances.musicals?.title
                  : "N/A"
              }
              style={{
                borderRadius: "5%",
                display: "block",
              }}
            />
          </div>
        </div>
        <div className={styles.centeredContent}>
          <MusicalByPremiereChart stats={stats} />
          <h1>Your musical taste is primarily ... {musicalTaste()}!</h1>
          <p>
            {musicalTasteDescription()} The average date of the musicals you
            have seen is {musicalPremiereAverage}. That means your average
            musical age is {musicalPremiereAverageAge}!
          </p>
        </div>
      </section>
      <section>
        <div className={styles.centeredContent}>
          <LocationsChart stats={stats} />
          <h1>You visited {mostVisitedLocation || "N/A"} the most!</h1>
          <p>
            You attended {numberOfLocations} different cities during the year,
            but visited {mostVisitedLocation || "N/A"} the most.{" "}
          </p>
        </div>
        <div className={styles.centeredContent}>
          <MonthlyAttendanceChart stats={stats} />
          <h1>
            You visited the theatre the most during ...{" "}
            {mostVisitsPerMonth || "N/A"}!
          </h1>
          <p>Stuff about when you went throughout the year.</p>
        </div>
      </section>
    </div>
  );
}

export default Statistics;
