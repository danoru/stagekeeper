import type { attendance, musicals, performances, plays, theatres, users } from "@prisma/client";
import superjson from "superjson";

import ActivityFeed from "../../../src/components/performances/ActivityFeed";
import ProfilePageWrapper from "../../../src/components/users/ProfilePageWrapper";
import { getUserAttendanceHistory } from "../../../src/data/performances";
import { findUserByUsername } from "../../../src/data/users";

interface Props {
  user: users;
  entries: (attendance & {
    performances:
      | (performances & {
          musicals: musicals | null;
          plays: plays | null;
          theatres: theatres;
        })
      | null;
    musicals: musicals | null;
    plays: plays | null;
    theatres: theatres | null;
  })[];
}

interface Context {
  params: { username: string };
}

function UserActivityPage({ entries, user }: Props) {
  return (
    <ProfilePageWrapper
      title={`${user.username}'s Activity • StageKeeper`}
      username={user.username}
    >
      <ActivityFeed entries={entries} />
    </ProfilePageWrapper>
  );
}

export async function getServerSideProps({ params }: Context) {
  const user = await findUserByUsername(params.username);
  if (!user) return { notFound: true };
  const entries = await getUserAttendanceHistory(user.id);
  return {
    props: superjson.serialize({ user, entries }).json,
  };
}

export default UserActivityPage;
