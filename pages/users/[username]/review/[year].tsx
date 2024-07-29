import Carousel from "../../../../src/components/review/Carousel";
import Head from "next/head";
import Highlights from "../../../../src/components/review/Highlights";
import ReviewHeader from "../../../../src/components/review/ReviewHeader";
import Statistics from "../../../../src/components/review/Statistics";
import superjson from "superjson";
import { Fragment } from "react";
import { getUserAttendanceByYear, getUsers } from "../../../../src/data/users";
import { attendance, musicals, performances, theatres } from "@prisma/client";

interface Props {
  musicals: (attendance & {
    performances: performances & { musicals: musicals; theatres: theatres };
  })[];
}

function ReviewPage({ musicals }: any) {
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
  const years = ["2020", "2021", "2022", "2023", "2024"];
  const paths = users.flatMap((user) =>
    years.map((year) => ({
      params: { username: user.username, year: year },
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
  let musicals: any[] = [];

  if (user) {
    const userId = user.id;
    musicals = await getUserAttendanceByYear(Number(year), userId);
  }

  return {
    props: superjson.serialize({
      musicals,
    }).json,
  };
}

export default ReviewPage;
