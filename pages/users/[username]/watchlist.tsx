import { users } from "@prisma/client";
import { GetServerSidePropsContext } from "next";
import superjson from "superjson";

import ShowList, { type ShowListItem } from "../../../src/components/shows/ShowList";
import ProfilePageWrapper from "../../../src/components/users/ProfilePageWrapper";
import { getUpcomingShowKeys, getWatchlist } from "../../../src/data/shows";
import { findUserByUsername } from "../../../src/data/users";

interface Props {
  upcomingShowKeys: string[];
  user: users;
  watchlist: ShowListItem[];
}

function UserWatchlist({ watchlist, user, upcomingShowKeys }: Props) {
  return (
    <ProfilePageWrapper
      title={`${user.username}'s Watchlist • StageKeeper`}
      username={user.username}
    >
      <ShowList
        emptyMessage="Nothing on the watchlist yet."
        header={`${user.username}'s Watchlist`}
        shows={watchlist}
        upcomingShowKeys={upcomingShowKeys}
      />
    </ProfilePageWrapper>
  );
}

export async function getServerSideProps({ params }: GetServerSidePropsContext) {
  const username = String(params?.username);
  const user = await findUserByUsername(username);
  if (!user) return { notFound: true };
  const [watchlist, upcomingShowKeys] = await Promise.all([
    getWatchlist(user.id),
    getUpcomingShowKeys(),
  ]);
  return {
    props: superjson.serialize({ watchlist, upcomingShowKeys, user }).json,
  };
}

export default UserWatchlist;
