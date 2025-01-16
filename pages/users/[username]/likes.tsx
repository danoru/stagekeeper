import Grid from "@mui/material/Grid";
import Head from "next/head";
import ShowList from "../../../src/components/shows/ShowList";
import ProfileLinkBar from "../../../src/components/users/ProfileLinkBar";
import superjson from "superjson";
import { getUsers, getUserLikes } from "../../../src/data/users";
import { likedShows, musicals, plays, users } from "@prisma/client";

interface Props {
  user: users & {
    likedShows: likedShows &
      {
        musicals: musicals;
        plays: plays;
      }[];
  };
}

interface Params {
  params: {
    username: string;
  };
}

function UserLikes({ user }: Props) {
  const title = `${user.username}'s Likes • Stagekeeper`;
  const header = `${user.username}'S LIKED SHOWS`;
  const shows = user.likedShows.map((user) => user.musicals);
  const style = "overline";

  return (
    <div>
      <Head>
        <title>{title}</title>
      </Head>
      <Grid container>
        <ProfileLinkBar username={user.username} />
        <ShowList shows={shows} header={header} style={style} />
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
