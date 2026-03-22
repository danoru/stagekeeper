import { musicals, plays, programming, users, watchlist } from "@prisma/client";
import superjson from "superjson";

import ShowList from "../../../src/components/shows/ShowList";
import ProfilePageWrapper from "../../../src/components/users/ProfilePageWrapper";
import { getUpcomingPerformances, getWatchlist } from "../../../src/data/shows";
import { findUserByUsername, getUsers } from "../../../src/data/users";

interface Props {
  upcomingPerformances: (programming & { musicals: musicals; plays: plays })[];
  user: users;
  watchlist: (watchlist & { musicals: musicals; plays: plays })[];
}

interface Params {
  params: { username: string };
}

function UserWatchlist({ watchlist, user, upcomingPerformances }: Props) {
  const shows = watchlist
    .map((show) => (show.type === "MUSICAL" ? show.musicals : show.plays))
    .filter(Boolean);

  return (
    <ProfilePageWrapper
      title={`${user.username}'s Watchlist • StageKeeper`}
      username={user.username}
    >
      <ShowList
        header={`${user.username}'s Watchlist`}
        shows={shows}
        upcomingPerformances={upcomingPerformances}
        emptyMessage="Nothing on the watchlist yet."
      />
    </ProfilePageWrapper>
  );
}

export async function getStaticPaths() {
  const users = await getUsers();
  return {
    paths: users.map((user) => ({ params: { username: user.username } })),
    fallback: "blocking",
  };
}

export async function getStaticProps({ params }: Params) {
  const { username } = params;
  const user = await findUserByUsername(username);
  if (!user) return { notFound: true };
  const [watchlist, upcomingPerformances] = await Promise.all([
    getWatchlist(user.id),
    getUpcomingPerformances(),
  ]);
  return {
    props: superjson.serialize({ watchlist, upcomingPerformances, user }).json,
    revalidate: 1800,
  };
}

export default UserWatchlist;
