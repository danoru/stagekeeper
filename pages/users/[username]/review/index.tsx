import Carousel from "../../../../src/components/review/Carousel";
import Head from "next/head";
import Highlights from "../../../../src/components/review/Highlights";
import ReviewHeader from "../../../../src/components/review/ReviewHeader";
import Statistics from "../../../../src/components/review/Statistics";
import superjson from "superjson";
import { attendance, musicals, performances, theatres } from "@prisma/client";
import { Fragment } from "react";
import { getUserAttendanceByYear, getUsers } from "../../../../src/data/users";

interface Props {
  musicals: (attendance & {
    performances: performances & { musicals: musicals; theatres: theatres };
  })[];
}

function ReviewPage({ musicals }: Props) {
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
    }).json,
  };
}

export default ReviewPage;
