import Grid from "@mui/material/Grid";
import { attendance, musicals, performances, theatres, users } from "@prisma/client";
import Head from "next/head";
import superjson from "superjson";

import UpcomingCalendar from "../../../src/components/schedule/UpcomingCalendar";
import ProfileLinkBar from "../../../src/components/users/ProfileLinkBar";
import { getUsers, findUserByUsername } from "../../../src/data/users";

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

function UserUpcomingPage({ user }: Props) {
  const title = `${user.username}'s Upcoming Musicals • Stagekeeper`;

  return (
    <div>
      <Head>
        <title>{title}</title>
      </Head>
      <Grid container>
        <ProfileLinkBar username={user.username} />
      </Grid>
      <UpcomingCalendar identifier={user.id} />
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

  return {
    props: superjson.serialize({ user }).json,
    revalidate: 1800,
  };
}

export default UserUpcomingPage;
