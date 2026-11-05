import { Box } from "@mui/material";
import { attendance, musicals, performances, plays, theatres } from "@prisma/client";
import { GetServerSidePropsContext } from "next";
import Head from "next/head";
import superjson from "superjson";

import Highlights from "../../../../src/components/review/Highlights";
import PerformanceCarousel from "../../../../src/components/review/PerformanceCarousel";
import ReviewHeader from "../../../../src/components/review/ReviewHeader";
import Statistics from "../../../../src/components/review/Statistics";
import { getUserAttendanceByYear, getUserReviewYears } from "../../../../src/data/performances";
import { findUserByUsername } from "../../../../src/data/users";
import { getViewer } from "../../../../src/utils/viewer";

interface Props {
  attendance: (attendance & {
    performances: performances & { musicals: musicals; plays: plays; theatres: theatres };
  })[];
  username: string;
  year: string;
  years: number[];
}

function YearReviewPage({ attendance, username, year, years }: Props) {
  return (
    <Box sx={{ background: "#080C14", minHeight: "100vh" }}>
      <Head>
        <title>
          {username} — {year} Year in Review • StageKeeper
        </title>
        <meta content={`See your ${year} theatre year in review.`} name="description" />
      </Head>
      <ReviewHeader username={username} year={year} years={years} />
      <PerformanceCarousel items={attendance} />
      <Highlights highlights={attendance} />
      <Statistics stats={attendance} view="year" year={year} />
    </Box>
  );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const username = String(context.params?.username);
  const year = String(context.params?.year);
  if (!/^[1-9]\d{3}$/.test(year)) return { notFound: true };
  const user = await findUserByUsername(username);
  if (!user) return { notFound: true };

  const viewer = await getViewer(context);
  const [attendance, years] = await Promise.all([
    getUserAttendanceByYear(Number(year), user.id, viewer.id),
    getUserReviewYears(user.id, viewer.id),
  ]);

  return {
    props: superjson.serialize({ attendance, username, year, years }).json,
  };
}

export default YearReviewPage;
