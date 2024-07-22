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
        <title>All Time Statistics • StageKeeper</title>
        <meta
          name="description"
          content="See what your All Time Statistics looks like!"
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
      { params: { username: "musicalsandmayhem", year: "2022" } },
      { params: { username: "musicalsandmayhem", year: "2023" } },
      { params: { username: "musicalsandmayhem", year: "2024" } },
      { params: { username: "danoru", year: "2022" } },
      { params: { username: "danoru", year: "2023" } },
      { params: { username: "danoru", year: "2024" } },
      { params: { username: "annabanza", year: "2022" } },
      { params: { username: "annabanza", year: "2023" } },
      { params: { username: "annabanza", year: "2024" } },
      { params: { username: "callmetommy", year: "2022" } },
      { params: { username: "callmetommy", year: "2023" } },
      // { params: { username: "callmetommy", year: "2024" } },
      // { params: { username: "bentothetop", year: "2022" } },
      // { params: { username: "bentothetop", year: "2023" } },
      // { params: { username: "bentothetop", year: "2024" } },
      { params: { username: "heartofsix", year: "2022" } },
      { params: { username: "heartofsix", year: "2023" } },
      // { params: { username: "heartofsix", year: "2024" } },
      { params: { username: "suddenlykelsey", year: "2022" } },
      { params: { username: "suddenlykelsey", year: "2023" } },
      // { params: { username: "suddenlykelsey", year: "2024" } },
      { params: { username: "all", year: "2022" } },
      { params: { username: "all", year: "2023" } },
      { params: { username: "all", year: "2024" } },
    ],
    fallback: false,
  };
}

export async function getStaticProps(context: any) {
  const username = context.params.username;

  let featuredMusicals = getFeaturedMusicals("", username);

  return {
    props: {
      musicals: featuredMusicals,
    },
    revalidate: 1800,
  };
}

export default ReviewPage;
