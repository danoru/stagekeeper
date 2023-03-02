import { Fragment, useState } from "react";

import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import Head from "next/head";

function UpcomingPage() {
  const [value, onChange] = useState(new Date());

  return (
    <Fragment>
      <Head>
        <title>StageKeeper: Your Upcoming Events</title>
        <meta name="description" content="See what your new year looks like!" />
      </Head>
      <h1>This page is currently in development.</h1>
      <Calendar onChange={onChange} value={value} />
    </Fragment>
  );
}

export default UpcomingPage;
