import { Box, Container } from "@mui/material";
import { following, musicals, plays, users, watchlist } from "@prisma/client";
import Head from "next/head";
import { getSession } from "next-auth/react";
import superjson from "superjson";

import FriendRecentActivity from "../../../src/components/performances/RecentActivity";
import ProfileLinkBar from "../../../src/components/users/ProfileLinkBar";
import ProfileStatBar from "../../../src/components/users/ProfileStatBar";
import UserFollowing from "../../../src/components/users/UserFollowing";
import UserWatchlistPreview from "../../../src/components/users/UserWatchlistPreview";
import { getRecentPerformances } from "../../../src/data/performances";
import { getUserProfile } from "../../../src/data/users";

interface Props {
  attendanceStats: {
    musicalsAttended: number;
    playsAttended: number;
    attendanceThisYear: number;
  };
  following: following[];
  followersCount: number;
  isFollowedByViewer: boolean;
  recentPerformances: any;
  sessionUser: any;
  user: users;
  watchlistPreview: (watchlist & { musicals: musicals | null; plays: plays | null })[];
  watchlistTotal: number;
}

interface Params {
  username: string;
}

function ProfilePage({
  attendanceStats,
  followersCount,
  following,
  isFollowedByViewer,
  recentPerformances,
  sessionUser,
  user,
  watchlistPreview,
  watchlistTotal,
}: Props) {
  const avatarSize = "64px";

  return (
    <Box sx={{ background: "#080C14", minHeight: "100vh" }}>
      <Head>
        <title>{user.username} • StageKeeper</title>
      </Head>

      {/* Profile header - full width */}
      <ProfileStatBar
        attendanceStats={attendanceStats}
        avatarSize={avatarSize}
        followersCount={followersCount}
        following={following}
        isFollowedByViewer={isFollowedByViewer}
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
            <UserWatchlistPreview
              items={watchlistPreview}
              total={watchlistTotal}
              username={user.username}
            />
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
  const viewerId = sessionUser ? Number(sessionUser.id) : undefined;

  const profile = await getUserProfile(username, viewerId);

  if (!profile) {
    return { notFound: true };
  }

  const recentPerformances = await getRecentPerformances([profile.user.username]);

  return {
    props: superjson.serialize({
      attendanceStats: profile.attendanceStats,
      following: profile.following,
      followersCount: profile.followersCount,
      isFollowedByViewer: profile.isFollowedByViewer,
      recentPerformances,
      sessionUser,
      user: profile.user,
      watchlistPreview: profile.watchlistPreview,
      watchlistTotal: profile.watchlistTotal,
    }).json,
  };
}

export default ProfilePage;
