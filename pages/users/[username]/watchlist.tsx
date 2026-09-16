import { musicals, plays, programming, users, watchlist } from "@prisma/client";
import { GetServerSidePropsContext } from "next";
import superjson from "superjson";

import ShowList from "../../../src/components/shows/ShowList";
import ProfilePageWrapper from "../../../src/components/users/ProfilePageWrapper";
import { getUpcomingPerformances, getWatchlist } from "../../../src/data/shows";
import { findUserByUsername } from "../../../src/data/users";

interface Props {
  upcomingPerformances: (programming & { musicals: musicals; plays: plays })[];
  user: users;
  watchlist: (watchlist & { musicals: musicals; plays: plays })[];
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
        emptyMessage="Nothing on the watchlist yet."
        header={`${user.username}'s Watchlist`}
        shows={shows}
        upcomingPerformances={upcomingPerformances}
      />
    </ProfilePageWrapper>
  );
}

export async function getServerSideProps({ params }: GetServerSidePropsContext) {
  const username = String(params?.username);
  const user = await findUserByUsername(username);
  if (!user) return { notFound: true };
  const [watchlist, upcomingPerformances] = await Promise.all([
    getWatchlist(user.id),
    getUpcomingPerformances(),
  ]);
  return {
    props: superjson.serialize({ watchlist, upcomingPerformances, user }).json,
  };
}

export default UserWatchlist;
