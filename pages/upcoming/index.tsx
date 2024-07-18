import { Fragment } from "react";
import Head from "next/head";

import EventCalendar from "../../src/components/schedule/event-calendar";

function UpcomingPage() {
  return (
    <Fragment>
      <Head>
        <title>Your Upcoming Events • StageKeeper</title>
        <meta name="description" content="See what your new year looks like!" />
      </Head>
      <h1>This page is currently in development.</h1>
      <EventCalendar />
    </Fragment>
  );
}

export default UpcomingPage;
