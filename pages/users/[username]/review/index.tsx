import { attendance, musicals, performances, theatres } from "@prisma/client";
import Head from "next/head";
import { Fragment } from "react";
import superjson from "superjson";

import Carousel from "../../../../src/components/review/Carousel";
import Highlights from "../../../../src/components/review/Highlights";
import ReviewHeader from "../../../../src/components/review/ReviewHeader";
import Statistics from "../../../../src/components/review/Statistics";
import { getUserAttendanceByYear } from "../../../../src/data/performances";
import { getUsers } from "../../../../src/data/users";

interface Props {
  musicals: (attendance & {
    performances: performances & { musicals: musicals; theatres: theatres };
  })[];
  username: string;
}

function ReviewPage({ musicals, username }: Props) {
  return (
    <Fragment>
      <Head>
        <title>All Time Statistics • StageKeeper</title>
        <meta content="See what your All Time Statistics looks like!" name="description" />
      </Head>
      <div>
        <ReviewHeader username={username} />
        <Carousel items={musicals} />
        <Highlights highlights={musicals} />
        <Statistics stats={musicals} view="allTime" />
      </div>
    </Fragment>
  );
}

export async function getStaticPaths() {
  const users = await getUsers();
  const paths = users.map((user) => ({
    params: { username: user.username },
  }));

  return {
    paths,
    fallback: false,
  };
}

export async function getStaticProps(context: any) {
  const { username } = context.params!;
  const users = await getUsers();
  const user = users.find((user) => user.username === username);
  let musicals: any[] = [];

  if (user) {
    const userId = user.id;
    musicals = await getUserAttendanceByYear(null, userId);
  }

  return {
    props: superjson.serialize({
      musicals,
      username,
    }).json,
  };
}

export default ReviewPage;
