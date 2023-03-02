import { Fragment, useState } from "react";

import Calendar from "react-calendar";
import Head from "next/head";

import styles from "../../src/styles/upcoming.module.css";
import "react-calendar/dist/Calendar.css";

function UpcomingPage() {
  const [value, onChange] = useState(new Date());
  const minimumDate = new Date("01-01-2023");
  const maximumDate = new Date("12-31-2024");

  return (
    <Fragment>
      <Head>
        <title>StageKeeper: Your Upcoming Events</title>
        <meta name="description" content="See what your new year looks like!" />
      </Head>
      <h1>This page is currently in development.</h1>
      <Calendar
        calendarType="US"
        className={styles.calendar}
        maxDate={maximumDate}
        minDate={minimumDate}
        minDetail="year"
        onChange={onChange}
        value={value}
      />
    </Fragment>
  );
}

export default UpcomingPage;
