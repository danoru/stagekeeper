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
  view: "allTime" | "year";
  year?: string;
}

function Statistics({ stats, view, year }: Props) {
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

  const currentYear = new Date().getFullYear();
  const musicalPremiereAverageAge = currentYear - musicalPremiereAverage;

  function musicalTaste(premiereYear: number) {
    if (premiereYear < 1920) return "Vaudeville";
    if (premiereYear < 1940) return "The Jazz Age";
    if (premiereYear < 1960) return "The Golden Age";
    if (premiereYear < 1970) return "The Post-Golden Age";
    if (premiereYear < 2000) return "Pre-Contemporary";
    if (premiereYear < 2020) return "Contemporary";
    return "Current";
  }

  function musicalTasteDescription(premiereYear: number) {
    const era = musicalTaste(premiereYear);
    const descriptions = {
      Vaudeville:
        "A time of variety acts and early musical theatre, where spectacle and showmanship took center stage.",
      "The Jazz Age":
        "A period of experimentation and innovation, marked by syncopated rhythms and bold storytelling.",
      "The Golden Age":
        "Classic Broadway at its finest, where timeless show tunes and heartfelt narratives became the standard.",
      "The Post-Golden Age":
        "A transitional period exploring new themes, rock influences, and shifting audience expectations.",
      "Pre-Contemporary":
        "A mix of blockbuster hits and boundary-pushing works, setting the stage for modern musical theatre.",
      Contemporary:
        "Musicals that embrace diverse styles, fresh narratives, and innovative staging techniques.",
      Current:
        "The evolving landscape of musical theatre today, where digital influences and genre-blending are redefining the art form.",
    };

    return descriptions[era] || "An undefined era of musical theatre.";
  }

  const musicalEra = musicalTaste(musicalPremiereAverage);
  const musicalEraDescription = musicalTasteDescription(musicalPremiereAverage);

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

  // View helpers
  const getYearText = () => (view === "allTime" ? "of All Time" : `of ${year}`);
  const getAdverbText = () => (view === "allTime" ? "" : "this year");

  return (
    <div>
      <section>
        <div className={styles.container}>
          <div className={styles.infoboxRight}>
            <h1>Your First Musical {getYearText()}</h1>
            <h3>
              {firstMusical ? firstMusical.performances.musicals?.title : "N/A"}
            </h3>
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
            <h1>Your Most Recent Musical {getYearText()}</h1>
            <h3>
              {latestMusical
                ? latestMusical.performances.musicals?.title
                : "N/A"}
            </h3>
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
            <h1>Oldest Musical {getYearText()}</h1>
            <h3>
              {" "}
              {oldestMusical
                ? oldestMusical.performances.musicals?.title
                : "N/A"}
              !
            </h3>
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
            <h1>Newest Musical {getYearText()}</h1>
            <h3>
              {newestMusical
                ? newestMusical.performances.musicals?.title
                : "N/A"}
              !
            </h3>
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
          <h1>Your musical taste is primarily ... {musicalEra}!</h1>
          <p>
            {musicalEraDescription} The average premiere date of the musicals
            you have seen is {musicalPremiereAverage}. That means your average
            musical age is {musicalPremiereAverageAge}!
          </p>
        </div>
      </section>

      <section>
        <div className={styles.centeredContent}>
          <LocationsChart stats={stats} />
          <h1>You visited {mostVisitedLocation || "N/A"} the most!</h1>
          <p>
            You attended {numberOfLocations} different cities
            {view === "year" && year ? ` in ${year}` : ""}, but visited{" "}
            {mostVisitedLocation || "N/A"} the most.
          </p>
        </div>
        <div className={styles.centeredContent}>
          <MonthlyAttendanceChart stats={stats} />
          <h1>
            You visited the theatre the most during ...{" "}
            {mostVisitsPerMonth || "N/A"} {getAdverbText()}!
          </h1>
          <p>Stuff about when you went {getAdverbText()}.</p>
        </div>
      </section>
    </div>
  );
}

export default Statistics;
