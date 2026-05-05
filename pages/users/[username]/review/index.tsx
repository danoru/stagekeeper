import { Box } from "@mui/material";
import { attendance, musicals, performances, plays, theatres } from "@prisma/client";
import Head from "next/head";
import superjson from "superjson";

import Highlights from "../../../../src/components/review/Highlights";
import PerformanceCarousel from "../../../../src/components/review/PerformanceCarousel";
import ReviewHeader from "../../../../src/components/review/ReviewHeader";
import Statistics from "../../../../src/components/review/Statistics";
import { getUserAttendanceByYear } from "../../../../src/data/performances";
import { findUserByUsername, getUsers } from "../../../../src/data/users";

interface Props {
  attendance: (attendance & {
    performances: performances & { musicals: musicals; plays: plays; theatres: theatres };
  })[];
  username: string;
}

function AllTimeReviewPage({ attendance, username }: Props) {
  return (
    <Box sx={{ background: "#080C14", minHeight: "100vh" }}>
      <Head>
        <title>{username} — All Time Statistics • StageKeeper</title>
        <meta content="See your all time theatre statistics." name="description" />
      </Head>
      <ReviewHeader username={username} />
      <PerformanceCarousel items={attendance} />
      <Highlights highlights={attendance} />
      <Statistics stats={attendance} view="allTime" />
    </Box>
  );
}

export async function getStaticPaths() {
  const users = await getUsers();
  return {
    paths: users.map((user) => ({ params: { username: user.username } })),
    fallback: false,
  };
}

export async function getStaticProps(context: any) {
  const { username } = context.params!;
  const user = await findUserByUsername(username);
  if (!user) return { notFound: true };

  const attendance = await getUserAttendanceByYear(null, user.id);

  return {
    props: superjson.serialize({ attendance, username }).json,
    revalidate: 3600,
  };
}

export default AllTimeReviewPage;
