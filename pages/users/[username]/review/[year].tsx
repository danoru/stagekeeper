import { Box } from "@mui/material";
import { attendance, musicals, performances, plays, theatres } from "@prisma/client";
import { GetServerSidePropsContext } from "next";
import Head from "next/head";
import superjson from "superjson";

import Highlights from "../../../../src/components/review/Highlights";
import PerformanceCarousel from "../../../../src/components/review/PerformanceCarousel";
import ReviewHeader from "../../../../src/components/review/ReviewHeader";
import Statistics from "../../../../src/components/review/Statistics";
import { getUserAttendanceByYear } from "../../../../src/data/performances";
import { getDistinctYears, findUserByUsername } from "../../../../src/data/users";

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
      <ReviewHeader maxYear={maxYear} minYear={minYear} username={username} year={year} />
      <PerformanceCarousel items={attendance} />
      <Highlights highlights={attendance} />
      <Statistics stats={attendance} view="year" year={year} />
    </Box>
  );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const username = String(context.params?.username);
  const year = String(context.params?.year);
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
  };
}

export default YearReviewPage;
