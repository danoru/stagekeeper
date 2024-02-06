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
      { params: { userId: "musicalsandmayhem", year: "2024" } },
      { params: { userId: "beingdaniel", year: "2022" } },
      { params: { userId: "beingdaniel", year: "2023" } },
      { params: { userId: "beingdaniel", year: "2024" } },
      { params: { userId: "annabanza", year: "2022" } },
      { params: { userId: "annabanza", year: "2023" } },
      { params: { userId: "annabanza", year: "2024" } },
      { params: { userId: "callmetommy", year: "2022" } },
      { params: { userId: "callmetommy", year: "2023" } },
      { params: { userId: "callmetommy", year: "2024" } },
      { params: { userId: "bentothetop", year: "2022" } },
      { params: { userId: "bentothetop", year: "2023" } },
      { params: { userId: "bentothetop", year: "2024" } },
      { params: { userId: "heartofsix", year: "2022" } },
      { params: { userId: "heartofsix", year: "2023" } },
      { params: { userId: "heartofsix", year: "2024" } },
      { params: { userId: "suddenlykelsey", year: "2022" } },
      { params: { userId: "suddenlykelsey", year: "2023" } },
      { params: { userId: "suddenlykelsey", year: "2024" } },
      { params: { userId: "all", year: "2022" } },
      { params: { userId: "all", year: "2023" } },
      { params: { userId: "all", year: "2024" } },
    ],
    fallback: false,
  };
}

export async function getStaticProps(context: any) {
  const userId = context.params.userId;

  let featuredMusicals = getFeaturedMusicals("", userId);

  return {
    props: {
      musicals: featuredMusicals,
    },
    revalidate: 1800,
  };
}

export default ReviewPage;
