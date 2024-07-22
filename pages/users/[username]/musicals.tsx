import Grid from "@mui/material/Grid";
import Head from "next/head";
import MusicalList from "../../../src/components/musical/MusicalList";
import ProfileLinkBar from "../../../src/components/users/ProfileLinkBar";
import superjson from "superjson";
import {
  getUsers,
  findUserByUsername,
  getUserAttendance,
} from "../../../src/data/users";
import { attendance, musicals, performances, users } from "@prisma/client";

interface Props {
  user: users;
  attendance: (attendance & {
    performance: performances & { musicals: musicals };
  })[];
}

interface Params {
  params: {
    username: string;
  };
}

function UserMusicalsList({ attendance, user }: Props) {
  const title = `${user.username}'s Musicals • Savry`;
  const musicalHeader = `${user.username}'S MUSICALS`;
  const musicals = attendance?.map((a) => a.performance.musicals);
  const style = "overline";

  return (
    <div>
      <Head>
        <title>{title}</title>
      </Head>
      <Grid container>
        <ProfileLinkBar username={user.username} />
        <MusicalList musicals={musicals} header={musicalHeader} style={style} />
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

export default UserMusicalsList;
