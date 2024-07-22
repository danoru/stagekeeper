import Grid from "@mui/material/Grid";
import Head from "next/head";
import MusicalList from "../../../src/components/musical/MusicalList";
import ProfileLinkBar from "../../../src/components/users/ProfileLinkBar";
import superjson from "superjson";
import { getUsers, getUserLikes } from "../../../src/data/users";
import { likedMusicals, musicals, users } from "@prisma/client";

interface Props {
  user: users & {
    likedMusicals: likedMusicals &
      {
        musicals: musicals;
      }[];
  };
}

interface Params {
  params: {
    username: string;
  };
}

function UserLikes({ user }: Props) {
  const title = `${user.username}'s Likes • Savry`;
  const musicalHeader = `${user.username}'S LIKED MUSICALS`;
  const musicals = user.likedMusicals.map((user) => user.musicals);
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
  const user = await getUserLikes(username);
  return {
    props: superjson.serialize({ user }).json,
    revalidate: 1800,
  };
}

export default UserLikes;
