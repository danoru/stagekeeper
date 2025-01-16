import Grid from "@mui/material/Grid";
import Head from "next/head";
import ShowList from "../../../src/components/shows/ShowList";
import ProfileLinkBar from "../../../src/components/users/ProfileLinkBar";
import superjson from "superjson";
import { findUserByUsername, getUsers } from "../../../src/data/users";
import { getUpcomingPerformances } from "../../../src/data/shows";
import { getWatchlist } from "../../../src/data/shows";
import { musicals, plays, programming, users, watchlist } from "@prisma/client";

interface Props {
  upcomingPerformances: (programming & {
    musicals: musicals;
    plays: plays;
  })[];
  user: users;
  watchlist: (watchlist & {
    musicals: musicals;
    plays: plays;
  })[];
}

interface Params {
  params: {
    username: string;
  };
}

function UserWatchlist({ watchlist, user, upcomingPerformances }: Props) {
  const title = `${user.username}'s Watchlist • Stagekeeper`;
  const header = `${user.username} WANTS TO WATCH ${watchlist.length} SHOWS`;
  const style = "overline";
  const shows = watchlist.map((show) =>
    show.type === "MUSICAL" ? show.musicals : show.plays
  );

  return (
    <div>
      <Head>
        <title>{title}</title>
      </Head>
      <Grid container>
        <ProfileLinkBar username={user.username} />
        <ShowList
          shows={shows}
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
  let watchlist;
  let upcomingPerformances;

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
