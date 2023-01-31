import { Fragment } from "react";
import Head from "next/head";

function UpcomingPage() {
  return (
    <Fragment>
      <Head>
        <title>StageKeeper: Your Upcoming Events</title>
        <meta name="description" content="See what your new year looks like!" />
      </Head>
      <blockquote cite="https://genius.com/Jonathan-groff-lost-in-the-woods-lyrics">
        Now I turn around and find I am lost in the woods, <br />
        North is south, right is left, when you're gone.
      </blockquote>
      <p>
        Are you lost? Let's get you back on <a href="/review">track</a>.
      </p>
    </Fragment>
  );
}

export default UpcomingPage;
