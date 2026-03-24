import { Box, Container } from "@mui/material";
import {
  attendance,
  following,
  musicals,
  performances,
  plays,
  users,
  watchlist,
} from "@prisma/client";
import Head from "next/head";
import { getSession } from "next-auth/react";
import superjson from "superjson";

import FriendRecentActivity from "../../../src/components/performances/RecentActivity";
import ProfileLinkBar from "../../../src/components/users/ProfileLinkBar";
import ProfileStatBar from "../../../src/components/users/ProfileStatBar";
import UserFollowing from "../../../src/components/users/UserFollowing";
import UserWatchlistPreview from "../../../src/components/users/UserWatchlistPreview";
import { getRecentPerformances } from "../../../src/data/performances";
import { getUserProfile, getFollowers } from "../../../src/data/users";

interface Props {
  attendance: (attendance & {
    performances: performances;
  })[];
  followers: following[];
  following: following[];
  recentPerformances: any;
  sessionUser: any;
  user: users;
  watchlist: (watchlist & { musicals: musicals; plays: plays })[];
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
    <Box sx={{ background: "#080C14", minHeight: "100vh" }}>
      <Head>
        <title>{user.username} • StageKeeper</title>
      </Head>

      {/* Profile header - full width */}
      <ProfileStatBar
        attendance={attendance}
        avatarSize={avatarSize}
        followers={followers}
        following={following}
        sessionUser={sessionUser}
        user={user}
      />

      {/* Nav tabs - full width */}
      <ProfileLinkBar username={user.username} />

      {/* Content */}
      <Container maxWidth="lg" sx={{ py: 3 }}>
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 280px" }, gap: 3 }}>
          {/* Left: recent shows + following */}
          <Box>
            <FriendRecentActivity recentPerformances={recentPerformances} trim={3} />
            <UserFollowing following={following} />
          </Box>

          {/* Right: watchlist */}
          <Box>
            <UserWatchlistPreview username={user.username} watchlist={watchlist} />
          </Box>
        </Box>
      </Container>
    </Box>
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

  const user = await getUserProfile(username);

  if (user) {
    watchlist = user.watchlist;
    attendance = user.attendance;
    followers = await getFollowers(username);
    following = user.following;
    recentPerformances = await getRecentPerformances([user.username]);
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
