import type { attendance, musicals, performances, plays, theatres, users } from "@prisma/client";
import { GetServerSidePropsContext } from "next";
import { getSession } from "next-auth/react";
import superjson from "superjson";

import GroupActivityFeed from "../../../src/components/groups/GroupActivityFeed";
import ActivityFeed from "../../../src/components/performances/ActivityFeed";
import ActivityScopeTabs, {
  ActivityScope,
} from "../../../src/components/users/ActivityScopeTabs";
import ProfilePageWrapper from "../../../src/components/users/ProfilePageWrapper";
import { getGroupActivityFeed, type GroupActivityEvent } from "../../../src/data/groups";
import { getUserAttendanceHistory } from "../../../src/data/performances";
import { findUserByUsername } from "../../../src/data/users";

type UserActivityEntry = attendance & {
  performances:
    | (performances & { musicals: musicals | null; plays: plays | null; theatres: theatres })
    | null;
  musicals: musicals | null;
  plays: plays | null;
  theatres: theatres | null;
};

type Props =
  | {
      user: users;
      scope: "mine";
      isSelf: boolean;
      entries: UserActivityEntry[];
    }
  | {
      user: users;
      scope: "groups";
      isSelf: true;
      events: GroupActivityEvent[];
    };

function UserActivityPage(props: Props) {
  return (
    <ProfilePageWrapper
      title={`${props.user.username}'s Activity • StageKeeper`}
      username={props.user.username}
    >
      {props.isSelf && (
        <ActivityScopeTabs scope={props.scope} username={props.user.username} />
      )}
      {props.scope === "mine" ? (
        <ActivityFeed entries={props.entries} />
      ) : (
        <GroupActivityFeed events={props.events} />
      )}
    </ProfilePageWrapper>
  );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const username = context.params?.username as string | undefined;
  if (!username) return { notFound: true };

  const user = await findUserByUsername(username);
  if (!user) return { notFound: true };

  const session = await getSession(context);
  const viewerId = session ? Number(session.user.id) : null;
  const isSelf = viewerId !== null && viewerId === user.id;

  const requestedScope = (context.query.scope as string | undefined) ?? "mine";
  const scope: ActivityScope =
    isSelf && requestedScope === "groups" ? "groups" : "mine";

  if (scope === "groups" && isSelf && viewerId !== null) {
    const events = await getGroupActivityFeed(viewerId);
    return {
      props: superjson.serialize({ user, scope, isSelf: true, events }).json,
    };
  }

  const entries = await getUserAttendanceHistory(user.id);
  return {
    props: superjson.serialize({ user, scope: "mine", isSelf, entries }).json,
  };
}

export default UserActivityPage;
