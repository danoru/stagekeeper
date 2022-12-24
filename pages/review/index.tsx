import { Fragment } from "react";
import Head from "next/head";

import { getFeaturedMusicals } from "../../src/data/2022-review";
import MusicalList from "../../src/components/events/musical-list";

import classes from "../../src/styles/review.module.css";

function ReviewPage(props: any) {
  const { musicals } = props;

  return (
    <Fragment>
      <Head>
        <title>StageKeeper: Your Past Events</title>
        <meta
          name="description"
          content="See what your year in review looks like!"
        />
      </Head>
      <MusicalList items={musicals} />
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
