import { Fragment } from "react";
import Head from "next/head";

import { getFeaturedMusicals } from "../../../../src/data/review";

import Carousel from "../../../../src/components/review/carousel";
import Highlights from "../../../../src/components/review/highlights";
import ReviewHeader from "../../../../src/components/review/review-header";
import Statistics from "../../../../src/components/review/statistics";

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

export async function getStaticPaths() {
  return {
    paths: [
      { params: { userId: "musicalsandmayhem", year: "2022" } },
      { params: { userId: "musicalsandmayhem", year: "2023" } },
      { params: { userId: "all", year: "2022" } },
      { params: { userId: "all", year: "2023" } },
    ],
    fallback: false,
  };
}

export async function getStaticProps(context: any) {
  const userId = context.params.userId;
  const year = context.params.year;

  let featuredMusicals = getFeaturedMusicals(year, userId);

  return {
    props: {
      musicals: featuredMusicals,
    },
    revalidate: 1800,
  };
}

export default ReviewPage;
