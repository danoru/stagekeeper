import Carousel from "../../../../src/components/review/Carousel";
import Head from "next/head";
import Highlights from "../../../../src/components/review/Highlights";
import ReviewHeader from "../../../../src/components/review/ReviewHeader";
import Statistics from "../../../../src/components/review/Statistics";
import superjson from "superjson";
import { attendance, musicals, performances, theatres } from "@prisma/client";
import { Fragment } from "react";
import { getDistinctYears, getUsers } from "../../../../src/data/users";
import { getUserAttendanceByYear } from "../../../../src/data/performances";

interface Props {
  musicals: (attendance & {
    performances: performances & { musicals: musicals; theatres: theatres };
  })[];
  username: string;
  year: string;
}

function ReviewPage({ musicals, username, year }: Props) {
  return (
    <Fragment>
      <Head>
        <title>Year in Review • StageKeeper</title>
        <meta
          name="description"
          content="See what your Year in Review looks like!"
        />
      </Head>
      <div>
        <ReviewHeader username={username} year={year} />
        <Carousel items={musicals} />
        <Highlights highlights={musicals} />
        <Statistics stats={musicals} />
      </div>
    </Fragment>
  );
}

export async function getStaticPaths() {
  const users = await getUsers();
  const years = await getDistinctYears();

  const paths = users.flatMap((user) =>
    years.map((year) => ({
      params: { username: user.username, year: year.toString() },
    }))
  );
  return {
    paths,
    fallback: false,
  };
}

export async function getStaticProps(context: any) {
  const { username, year } = context.params!;
  const users = await getUsers();
  const user = users.find((user) => user.username === username);
  let musicals: (attendance & {
    performances: performances & { musicals: musicals; theatres: theatres };
  })[] = [];

  if (user) {
    const userId = user.id;
    musicals = await getUserAttendanceByYear(Number(year), userId);
  }

  return {
    props: superjson.serialize({
      musicals,
      username,
      year,
    }).json,
  };
}

export default ReviewPage;
