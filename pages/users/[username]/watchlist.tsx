import Grid from "@mui/material/Grid";
import Head from "next/head";
import MusicalList from "../../../src/components/musical/MusicalList";
import ProfileLinkBar from "../../../src/components/users/ProfileLinkBar";
import superjson from "superjson";
import { findUserByUsername, getUsers } from "../../../src/data/users";
import { getUpcomingPerformances } from "../../../src/data/performances";
import { getWatchlist } from "../../../src/data/musicals";
import { watchlist, musicals, users, programming } from "@prisma/client";

interface Props {
  upcomingPerformances: (programming & {
    musicals: musicals;
  })[];
  user: users;
  watchlist: (watchlist & { musicals: musicals })[];
}

interface Params {
  params: {
    username: string;
  };
}

function UserWatchlist({ watchlist, user, upcomingPerformances }: Props) {
  const title = `${user.username}'s Watchlist • Savry`;
  const header = `${user.username} WANTS TO WATCH ${watchlist.length} MUSICALS`;
  const style = "overline";
  const musicals = watchlist.map((item) => item.musicals);

  return (
    <div>
      <Head>
        <title>{title}</title>
      </Head>
      <Grid container>
        <ProfileLinkBar username={user.username} />
        <MusicalList
          musicals={musicals}
          header={header}
          upcomingPerformances={upcomingPerformances}
          style={style}
        />
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
  let watchlist: watchlist[] = [];
  let upcomingPerformances: any[] = [];

  if (user) {
    watchlist = await getWatchlist(user.id);
    upcomingPerformances = await getUpcomingPerformances();
  }

  return {
    props: superjson.serialize({
      watchlist,
      upcomingPerformances,
      user,
    }).json,
    revalidate: 1800,
  };
}

export default UserWatchlist;
