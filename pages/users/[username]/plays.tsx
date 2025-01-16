import Grid from "@mui/material/Grid";
import Head from "next/head";
import moment from "moment";
import ShowList from "../../../src/components/shows/ShowList";
import ProfileLinkBar from "../../../src/components/users/ProfileLinkBar";
import superjson from "superjson";
import {
  attendance,
  plays,
  performances,
  theatres,
  users,
} from "@prisma/client";
import { getUsers, findUserByUsername } from "../../../src/data/users";
import { getUserPlayAttendance } from "../../../src/data/plays";

interface Props {
  user: users;
  attendance: (attendance & {
    performances: performances & { plays: plays; theatres: theatres };
  })[];
}

interface Params {
  params: {
    username: string;
  };
}

function UserPlaysList({ attendance, user }: Props) {
  const title = `${user.username}'s Plays • Stagekeeper`;
  const musicalHeader = `${user.username}'S PLAYS`;
  const style = "overline";

  const currentDate = moment();
  const uniqueTitles = new Set<string>();
  const filteredAttendance = attendance.filter((a) => {
    const startTime = moment(a.performances.startTime);
    const title = a.performances.plays?.title;
    if (startTime <= currentDate && !uniqueTitles.has(title)) {
      uniqueTitles.add(title);
      return true;
    }
    return false;
  });

  const plays = filteredAttendance?.map((a) => a.performances.plays);

  return (
    <div>
      <Head>
        <title>{title}</title>
      </Head>
      <Grid container>
        <ProfileLinkBar username={user.username} />
        <ShowList shows={plays} header={musicalHeader} style={style} />
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
    attendance = await getUserPlayAttendance(user.id);
  }

  return {
    props: superjson.serialize({ attendance, user }).json,
    revalidate: 1800,
  };
}

export default UserPlaysList;
