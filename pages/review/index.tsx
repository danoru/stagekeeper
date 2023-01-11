import { Fragment } from "react";
import Head from "next/head";

import { getFeaturedMusicals } from "../../src/data/2022-review";
import Carousel from "../../src/components/review/carousel";
import Highlights from "../../src/components/review/highlights";
import ReviewHeader from "../../src/components/review/review-header";
import Statistics from "../../src/components/review/statistics";

import styles from "../../src/styles/review.module.css";

function ReviewPage(props: any) {
  const { musicals } = props;
  const musicalCount = musicals.length;

  return (
    <Fragment>
      <Head>
        <title>StageKeeper: Year in Review</title>
        <meta
          name="description"
          content="See what your Year in Review looks like!"
        />
      </Head>
      <div>
        <ReviewHeader />
        <Carousel items={musicals} />
        <Highlights highlights={musicals} />
        <Statistics stats={musicals} />
      </div>
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
