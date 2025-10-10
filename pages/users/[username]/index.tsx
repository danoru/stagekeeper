import Grid from "@mui/material/Grid";
import { attendance, following, musicals, performances, users, watchlist } from "@prisma/client";
import { getSession } from "next-auth/react";
import superjson from "superjson";

import FriendRecentActivity from "../../../src/components/performances/RecentActivity";
import ProfileLinkBar from "../../../src/components/users/ProfileLinkBar";
import ProfileStatBar from "../../../src/components/users/ProfileStatBar";
import UserFollowing from "../../../src/components/users/UserFollowing";
import UserWatchlistPreview from "../../../src/components/users/UserWatchlistPreview";
import { getRecentPerformances } from "../../../src/data/performances";
import { getUserProfile, getFollowers } from "../../../src/data/users";
import prisma from "../../../src/data/db";

interface Props {
  attendance: (attendance & {
    performances: performances;
  })[];
  followers: following[];
  following: following[];
  recentPerformances: any;
  sessionUser: any;
  user: users;
  watchlist: (watchlist & { musicals: musicals })[];
}

interface Params {
  username: string;
}

function ProfilePage({
  attendance,
  followers,
  following,
  recentPerformances,
  sessionUser,
  user,
  watchlist,
}: Props) {
  const avatarSize = "64px";

  return (
    <div>
      <h1>Hello, {user.username}!</h1>
      <div>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12 }}>
            <ProfileStatBar
              attendance={attendance}
              avatarSize={avatarSize}
              followers={followers}
              following={following}
              sessionUser={sessionUser}
              user={user}
            />
            <ProfileLinkBar username={user.username} />
          </Grid>
          <Grid size={{ xs: 8 }}>
            <FriendRecentActivity recentPerformances={recentPerformances} trim={4} />
            <UserFollowing following={following} />
          </Grid>
          <Grid size={{ xs: 4 }}>
            <UserWatchlistPreview username={user.username} watchlist={watchlist} />
          </Grid>
        </Grid>
      </div>
    </div>
  );
}

export async function getServerSideProps(context: { params: Params; req: any }) {
  const { username } = context.params;
  const session = await getSession({ req: context.req });
  const sessionUser = session?.user || null;

  let watchlist: watchlist[] = [];
  let attendance: attendance[] = [];
  let followers: following[] = [];
  let following: following[] = [];
  let recentPerformances: any[] = [];

  const user = await prisma.users.findUnique({
    where: { username },
    include: {
      watchlist: { include: { musicals: true } },
      attendance: {
        include: { performances: true },
        orderBy: { performances: { startTime: "desc" } },
      },
      following: true,
    },
  });

  if (user) {
    followers = await prisma.following.findMany({
      where: { followingUsername: username },
      include: { users: true },
    });
    recentPerformances = await prisma.attendance.findMany({
      where: {
        users: { username: { in: [user.username] } },
        performances: { startTime: { lte: new Date() } },
      },
      include: {
        performances: { include: { musicals: true, theatres: true } },
      },
      orderBy: { performances: { startTime: "desc" } },
      take: 20,
    });
  }

  return {
    props: superjson.serialize({
      attendance,
      following,
      followers,
      recentPerformances,
      sessionUser,
      user,
      watchlist,
    }).json,
  };
}

export default ProfilePage;
