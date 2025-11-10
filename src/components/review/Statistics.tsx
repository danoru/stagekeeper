import type { attendance, musicals, performances, plays, theatres } from "@prisma/client";
import moment from "moment";
import Image from "next/image";

import styles from "../../styles/statistics.module.css";

import LocationsChart from "./LocationsChart";
import MonthlyAttendanceChart from "./MonthlyAttendance";
import PerformanceByPremiereChart from "./PerformanceByPremiere";

interface Props {
  stats: (attendance & {
    performances: performances & { musicals: musicals; plays: plays; theatres: theatres };
  })[];
  view: "allTime" | "year";
  year?: string;
}

function Statistics({ stats, view, year }: Props) {
  const hasData = stats.length > 0;

  const getPerformanceTitle = (stat: (typeof stats)[0]) =>
    stat.performances.musicals?.title || stat.performances.plays?.title || "N/A";

  const getPerformancePremiere = (stat: (typeof stats)[0]) =>
    moment(
      stat.performances.musicals?.premiere || stat.performances.plays?.premiere || null
    ).year();

  // First and Latest Performances
  const firstPerformance = hasData
    ? stats.reduce((a, b) => (a.performances.startTime < b.performances.startTime ? a : b))
    : null;

  const latestPerformance = hasData
    ? stats.reduce((a, b) => (a.performances.startTime > b.performances.startTime ? a : b))
    : null;

  // Oldest and Newest Premieres
  const oldestPerformance = hasData
    ? stats.reduce((a, b) => {
        const premiereA = getPerformancePremiere(a) ?? new Date();
        const premiereB = getPerformancePremiere(b) ?? new Date();
        return premiereA < premiereB ? a : b;
      })
    : null;

  const newestPerformance = hasData
    ? stats.reduce((a, b) => {
        const premiereA = getPerformancePremiere(a) ?? new Date("1066-09-12");
        const premiereB = getPerformancePremiere(b) ?? new Date("1066-09-12");
        return premiereA > premiereB ? a : b;
      })
    : null;

  // Locations Visited
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

  // Performance Premieres
  const premieres = stats.map((stat) => getPerformancePremiere(stat)).filter((year) => year);

  const premiereSum = premieres.length > 0 ? premieres.reduce((a, b) => a + b, 0) : 0;

  const premiereAverage = premieres.length > 0 ? Math.round(premiereSum / premieres.length) : 0;

  const currentYear = new Date().getFullYear();
  const averagePerformanceAge = currentYear - premiereAverage;

  // Performance Taste
  function performanceTaste(premiereYear: number) {
    if (premiereYear < 1920) return "Vaudeville";
    if (premiereYear < 1940) return "The Jazz Age";
    if (premiereYear < 1960) return "The Golden Age";
    if (premiereYear < 1970) return "The Post-Golden Age";
    if (premiereYear < 2000) return "Pre-Contemporary";
    if (premiereYear < 2020) return "Contemporary";
    return "Current";
  }

  function performanceTasteDescription(premiereYear: number) {
    const era = performanceTaste(premiereYear);
    const descriptions = {
      Vaudeville:
        "A time of variety acts and early theatre, where spectacle and showmanship took center stage.",
      "The Jazz Age":
        "A period of experimentation and innovation, marked by bold storytelling and new styles.",
      "The Golden Age":
        "Classic theatre at its finest, with timeless works that defined their genres.",
      "The Post-Golden Age":
        "A transitional period exploring new themes and shifting audience expectations.",
      "Pre-Contemporary":
        "A mix of blockbuster hits and boundary-pushing works, setting the stage for modern theatre.",
      Contemporary:
        "Performances that embrace diverse styles, fresh narratives, and innovative staging techniques.",
      Current:
        "The evolving landscape of theatre today, where genre-blending is redefining the art form.",
    };
    return descriptions[era] || "An undefined era of theatre.";
  }

  const performanceEra = performanceTaste(premiereAverage);
  const performanceEraDescription = performanceTasteDescription(premiereAverage);

  // Visits by Month
  const monthlyOccurrence: Record<string, { musicals: number; plays: number }> = {};

  stats.forEach((stat) => {
    const month = moment(stat.performances.startTime).format("MMMM");
    if (!monthlyOccurrence[month]) monthlyOccurrence[month] = { musicals: 0, plays: 0 };
    if (stat.performances.musicals?.title) monthlyOccurrence[month].musicals++;
    if (stat.performances.plays?.title) monthlyOccurrence[month].plays++;
  });

  const mostVisitsPerMonth =
    Object.keys(monthlyOccurrence).length > 0
      ? Object.keys(monthlyOccurrence).reduce((a, b) =>
          monthlyOccurrence[a].musicals + monthlyOccurrence[a].plays >
          monthlyOccurrence[b].musicals + monthlyOccurrence[b].plays
            ? a
            : b
        )
      : null;

  const getYearText = () => (view === "allTime" ? "of All Time" : `of ${year}`);
  const getAdverbText = () => (view === "allTime" ? "" : "this year");

  return (
    <div>
      <section>
        <div className={styles.container}>
          <div className={styles.infoboxRight}>
            <h1>Your First Performance {getYearText()}</h1>
            <h3>{firstPerformance ? getPerformanceTitle(firstPerformance) : "N/A"}</h3>
            <p>
              You watched {firstPerformance ? getPerformanceTitle(firstPerformance) : "N/A"} at{" "}
              {firstPerformance ? firstPerformance.performances.theatres.name : "N/A"} in{" "}
              {firstPerformance ? firstPerformance.performances.theatres.location : "N/A"} on{" "}
              {firstPerformance
                ? moment(firstPerformance.performances.startTime).format("MMMM Do, YYYY")
                : "N/A"}
              !
            </p>
          </div>
          <div className={styles.playbillRight}>
            <Image
              alt={firstPerformance ? getPerformanceTitle(firstPerformance) : "N/A"}
              height={280}
              src={
                firstPerformance?.performances.musicals?.playbill ||
                firstPerformance?.performances.plays?.playbill ||
                ""
              }
              style={{ borderRadius: "5%", display: "block" }}
              width={210}
            />
          </div>
        </div>
        <div className={styles.container}>
          <div className={styles.infoboxLeft}>
            <h1>Your Most Recent Performance {getYearText()}</h1>
            <h3>{latestPerformance ? getPerformanceTitle(latestPerformance) : "N/A"}</h3>
            <p>
              You watched {latestPerformance ? getPerformanceTitle(latestPerformance) : "N/A"} at{" "}
              {latestPerformance ? latestPerformance.performances.theatres.name : "N/A"} in{" "}
              {latestPerformance ? latestPerformance.performances.theatres.location : "N/A"} on{" "}
              {latestPerformance
                ? moment(latestPerformance.performances.startTime).format("MMMM Do, YYYY")
                : "N/A"}
              !
            </p>
          </div>
          <div className={styles.playbillLeft}>
            <Image
              alt={latestPerformance ? getPerformanceTitle(latestPerformance) : "N/A"}
              height={280}
              src={
                latestPerformance?.performances.musicals?.playbill ||
                latestPerformance?.performances.plays?.playbill ||
                ""
              }
              style={{ borderRadius: "5%", display: "block" }}
              width={210}
            />
          </div>
        </div>
      </section>
      <section>
        <div className={styles.container}>
          <div className={styles.infoboxRight}>
            <h1>Oldest Performance {getYearText()}</h1>
            <h3> {oldestPerformance ? oldestPerformance.performances.musicals?.title : "N/A"}!</h3>
            <p>
              You watched{" "}
              {oldestPerformance ? oldestPerformance.performances.musicals?.title : "N/A"} at the{" "}
              {oldestPerformance ? oldestPerformance.performances.theatres.name : "N/A"} in{" "}
              {oldestPerformance ? oldestPerformance.performances.theatres.location : "N/A"} on{" "}
              {oldestPerformance
                ? moment(oldestPerformance.performances.startTime).format("MMMM Do, YYYY")
                : "N/A"}
              !
            </p>
          </div>
          <div className={styles.playbillRight}>
            <Image
              alt={oldestPerformance ? oldestPerformance.performances.musicals?.title : "N/A"}
              height={280}
              src={oldestPerformance ? oldestPerformance.performances.musicals?.playbill : ""}
              style={{
                borderRadius: "5%",
                display: "block",
              }}
              width={210}
            />
          </div>
        </div>
        <div className={styles.container}>
          <div className={styles.infoboxLeft}>
            <h1>Newest Performance {getYearText()}</h1>
            <h3>{newestPerformance ? newestPerformance.performances.musicals?.title : "N/A"}!</h3>
            <p>
              You watched{" "}
              {newestPerformance ? newestPerformance.performances.musicals?.title : "N/A"} at the{" "}
              {newestPerformance ? newestPerformance.performances.theatres.name : "N/A"} in{" "}
              {newestPerformance ? newestPerformance.performances.theatres.location : "N/A"} on{" "}
              {newestPerformance
                ? moment(newestPerformance.performances.startTime).format("MMMM Do, YYYY")
                : "N/A"}
              !
            </p>
          </div>
          <div className={styles.playbillLeft}>
            <Image
              alt={newestPerformance ? newestPerformance.performances.musicals?.title : "N/A"}
              height={280}
              src={newestPerformance ? newestPerformance.performances.musicals?.playbill : ""}
              style={{
                borderRadius: "5%",
                display: "block",
              }}
              width={210}
            />
          </div>
        </div>
        <div className={styles.centeredContent}>
          <PerformanceByPremiereChart stats={stats} />
          <h1>Your performance taste is primarily ... {performanceEra}!</h1>
          <p>
            {performanceEraDescription} The average premiere date of the performances you have seen
            is {premiereAverage}. That means your average performance age is {averagePerformanceAge}
            !
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
            You visited the theatre the most during ... {mostVisitsPerMonth || "N/A"}{" "}
            {getAdverbText()}!
          </h1>
          <p>Placeholder text about when you went {getAdverbText()}.</p>
        </div>
      </section>
    </div>
  );
}

export default Statistics;
