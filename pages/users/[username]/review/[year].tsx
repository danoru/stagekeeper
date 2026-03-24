import { Box } from "@mui/material";
import { attendance, musicals, performances, plays, theatres } from "@prisma/client";
import Head from "next/head";
import superjson from "superjson";

import Highlights from "../../../../src/components/review/Highlights";
import PerformanceCarousel from "../../../../src/components/review/PerformanceCarousel";
import ReviewHeader from "../../../../src/components/review/ReviewHeader";
import Statistics from "../../../../src/components/review/Statistics";
import { getUserAttendanceByYear } from "../../../../src/data/performances";
import { getDistinctYears, findUserByUsername, getUsers } from "../../../../src/data/users";

interface Props {
  attendance: (attendance & {
    performances: performances & { musicals: musicals; plays: plays; theatres: theatres };
  })[];
  username: string;
  year: string;
  minYear: number;
  maxYear: number;
}

function YearReviewPage({ attendance, username, year, minYear, maxYear }: Props) {
  return (
    <Box sx={{ background: "#080C14", minHeight: "100vh" }}>
      <Head>
        <title>
          {username} — {year} Year in Review • StageKeeper
        </title>
        <meta content={`See your ${year} theatre year in review.`} name="description" />
      </Head>
      <ReviewHeader username={username} year={year} minYear={minYear} maxYear={maxYear} />
      <PerformanceCarousel items={attendance} />
      <Highlights highlights={attendance} />
      <Statistics stats={attendance} view="year" year={year} />
    </Box>
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

  return { paths, fallback: "blocking" };
}

export async function getStaticProps(context: any) {
  const { username, year } = context.params!;
  const user = await findUserByUsername(username);
  if (!user) return { notFound: true };

  const [attendance, allYears] = await Promise.all([
    getUserAttendanceByYear(Number(year), user.id),
    getDistinctYears(),
  ]);

  const minYear = allYears.length > 0 ? Math.min(...allYears) : Number(year);
  const maxYear = allYears.length > 0 ? Math.max(...allYears) : Number(year);

  return {
    props: superjson.serialize({
      attendance,
      username,
      year,
      minYear,
      maxYear,
    }).json,
    revalidate: 3600,
  };
}

export default YearReviewPage;
