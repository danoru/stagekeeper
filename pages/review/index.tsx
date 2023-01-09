import { Fragment } from "react";
import Head from "next/head";

import { getFeaturedMusicals } from "../../src/data/2022-review";
import Carousel from "../../src/components/review/carousel";

function ReviewPage(props: any) {
  const { musicals } = props;
  const musicalCount = musicals.length;

  return (
    <Fragment>
      <Head>
        <title>StageKeeper: Your Past Events</title>
        <meta
          name="description"
          content="See what your year in review looks like!"
        />
      </Head>
      <h1>Musicals & Mayhem</h1>
      <Carousel items={musicals} />
      <p>You saw {musicalCount} musicals as a group in 2022.</p>
      <p>You saw this.</p>
    </Fragment>
  );
}

export async function getStaticProps() {
  const featuredMusicals = await getFeaturedMusicals();

  return {
    props: {
      musicals: featuredMusicals,
    },
    revalidate: 1800,
  };
}

export default ReviewPage;
