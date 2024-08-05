import Grid from "@mui/material/Grid";
import Head from "next/head";
import moment from "moment";
import PerformanceCalendar from "../../../src/components/schedule/PerformanceCalendar";
import ProfileLinkBar from "../../../src/components/users/ProfileLinkBar";
import superjson from "superjson";
import {
  attendance,
  musicals,
  performances,
  theatres,
  users,
} from "@prisma/client";
import { getUsers, findUserByUsername } from "../../../src/data/users";
import { getUserAttendance } from "../../../src/data/performances";

interface Props {
  user: users;
  attendance: (attendance & {
    performances: performances & { musicals: musicals; theatres: theatres };
  })[];
}

interface Params {
  params: {
    username: string;
  };
}

function UserUpcomingPage({ attendance, user }: Props) {
  const title = `${user.username}'s Upcoming Musicals • Savry`;

  const currentDate = moment();
  const uniqueTitles = new Set<string>();
  const filteredAttendance = attendance.filter((a) => {
    const startTime = moment(a.performances.startTime);
    const title = a.performances.musicals.title;
    if (startTime <= currentDate && !uniqueTitles.has(title)) {
      uniqueTitles.add(title);
      return true;
    }
    return false;
  });

  const musicals = filteredAttendance?.map((a) => a.performances.musicals);

  return (
    <div>
      <Head>
        <title>{title}</title>
      </Head>
      <Grid container>
        <ProfileLinkBar username={user.username} />
        <PerformanceCalendar />
      </Grid>
    </div>
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

export async function getStaticProps({ params }: Params) {
  const { username } = params;
  const user = await findUserByUsername(username);
  let attendance;

  if (user) {
    attendance = await getUserAttendance(user.id);
  }

  return {
    props: superjson.serialize({ attendance, user }).json,
    revalidate: 1800,
  };
}

export default UserUpcomingPage;
