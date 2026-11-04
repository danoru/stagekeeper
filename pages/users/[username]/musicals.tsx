import { users } from "@prisma/client";
import { GetServerSidePropsContext } from "next";
import superjson from "superjson";

import ShowList, { type ShowListItem } from "../../../src/components/shows/ShowList";
import ProfilePageWrapper from "../../../src/components/users/ProfilePageWrapper";
import { getUserSeenShows } from "../../../src/data/shows";
import { findUserByUsername } from "../../../src/data/users";
import { getViewer } from "../../../src/utils/viewer";

interface Props {
  shows: ShowListItem[];
  user: users;
}

function UserMusicalsList({ shows, user }: Props) {
  return (
    <ProfilePageWrapper
      title={`${user.username}'s Musicals • StageKeeper`}
      username={user.username}
    >
      <ShowList
        emptyMessage="No musicals logged yet."
        header={`${user.username}'s Musicals`}
        shows={shows}
      />
    </ProfilePageWrapper>
  );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const username = String(context.params?.username);
  const user = await findUserByUsername(username);
  if (!user) return { notFound: true };
  const viewer = await getViewer(context);
  const shows = await getUserSeenShows(user.id, "MUSICAL", viewer.id);
  return {
    props: superjson.serialize({ shows, user }).json,
  };
}

export default UserMusicalsList;
