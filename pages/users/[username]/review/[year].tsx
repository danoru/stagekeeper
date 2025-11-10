import { attendance, musicals, performances, plays, theatres } from "@prisma/client";
import Head from "next/head";
import { Fragment } from "react";
import superjson from "superjson";

import PerformanceCarousel from "../../../../src/components/review/PerformanceCarousel";
import Highlights from "../../../../src/components/review/Highlights";
import ReviewHeader from "../../../../src/components/review/ReviewHeader";
import Statistics from "../../../../src/components/review/Statistics";
import { getUserAttendanceByYear } from "../../../../src/data/performances";
import { getDistinctYears, getUsers } from "../../../../src/data/users";

interface Props {
  attendance: (attendance & {
    performances: performances & { musicals: musicals; plays: plays; theatres: theatres };
  })[];
  username: string;
  year: string;
}

function ReviewPage({ attendance, username, year }: Props) {
  return (
    <Fragment>
      <Head>
        <title>Year in Review • StageKeeper</title>
        <meta content="See what your Year in Review looks like!" name="description" />
      </Head>
      <div>
        <ReviewHeader username={username} year={year} />
        <PerformanceCarousel items={attendance} />
        <Highlights highlights={attendance} />
        <Statistics stats={attendance} view="year" year={year} />
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
  let attendance: (attendance & {
    performances: performances & {
      musicals: musicals | null;
      plays: plays | null;
      theatres: theatres;
    };
  })[] = [];

  if (user) {
    const userId = user.id;
    attendance = await getUserAttendanceByYear(Number(year), userId);
  }

  return {
    props: superjson.serialize({
      attendance,
      username,
      year,
    }).json,
  };
}

export default ReviewPage;
