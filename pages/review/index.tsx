import Head from "next/head";
import { Fragment } from "react";

import MusicalList from "../../src/components/events/musical-list";
import { getFeaturedMusicals } from "../../src/data/2022-review";

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
      <h1>Hi.</h1>
      <MusicalList items={musicals} />
    </Fragment>
  );
}

export async function getStaticProps() {
  const featuredMusicals = await getFeaturedMusicals();

  return {
    props: {
      events: featuredMusicals,
    },
    revalidate: 1800,
  };
}

export default ReviewPage;
