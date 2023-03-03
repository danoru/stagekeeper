import { Fragment } from "react";
import Head from "next/head";

import EventCalendar from "../../src/components/upcoming/event-calendar";

function UpcomingPage() {
  return (
    <Fragment>
      <Head>
        <title>StageKeeper: Your Upcoming Events</title>
        <meta name="description" content="See what your new year looks like!" />
      </Head>
      <h1>This page is currently in development.</h1>
      <EventCalendar />
    </Fragment>
  );
}

export default UpcomingPage;
