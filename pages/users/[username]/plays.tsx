import { users } from "@prisma/client";
import { GetServerSidePropsContext } from "next";
import superjson from "superjson";

import ShowList, { type ShowListItem } from "../../../src/components/shows/ShowList";
import ProfilePageWrapper from "../../../src/components/users/ProfilePageWrapper";
import { getUserSeenShows } from "../../../src/data/shows";
import { findUserByUsername } from "../../../src/data/users";

interface Props {
  shows: ShowListItem[];
  user: users;
}

function UserPlaysList({ shows, user }: Props) {
  return (
    <ProfilePageWrapper title={`${user.username}'s Plays • StageKeeper`} username={user.username}>
      <ShowList
        emptyMessage="No plays logged yet."
        header={`${user.username}'s Plays`}
        shows={shows}
      />
    </ProfilePageWrapper>
  );
}

export async function getServerSideProps({ params }: GetServerSidePropsContext) {
  const username = String(params?.username);
  const user = await findUserByUsername(username);
  if (!user) return { notFound: true };
  const shows = await getUserSeenShows(user.id, "PLAY");
  return {
    props: superjson.serialize({ shows, user }).json,
  };
}

export default UserPlaysList;
