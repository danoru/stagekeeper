import Grid from "@mui/material/Grid";
import ProfileLinkBar from "../../../src/components/users/ProfileLinkBar";
import ProfileStatBar from "../../../src/components/users/ProfileStatBar";
import superjson from "superjson";
import UserWatchlistPreview from "../../../src/components/users/UserWatchlistPreview";
import {
  attendance,
  following,
  musicals,
  users,
  watchlist,
} from "@prisma/client";
import { getUserProfile, getFollowers } from "../../../src/data/users";
import { getSession } from "next-auth/react";
import { useRouter } from "next/router";

interface Props {
  attendance: (attendance & { users: users; musicals: musicals })[];
  followers: following[];
  following: following[];
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
  sessionUser,
  user,
  watchlist,
}: Props) {
  const router = useRouter();
  const username = router.query.username;
  const avatarSize = "64px";

  return (
    <div>
      <h1>Hello, {username}!</h1>
      {/* <EventCalendar /> */}
      <div>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <ProfileStatBar
              attendance={attendance}
              avatarSize={avatarSize}
              following={following}
              followers={followers}
              sessionUser={sessionUser}
              user={user}
            />
            <ProfileLinkBar username={user.username} />
          </Grid>{" "}
          <Grid item xs={8}></Grid>
          <Grid item xs={4}>
            <UserWatchlistPreview watchlist={watchlist} />
          </Grid>
        </Grid>
      </div>
    </div>
  );
}

export async function getServerSideProps(context: {
  params: Params;
  req: any;
}) {
  const { username } = context.params;
  const session = await getSession({ req: context.req });
  const sessionUser = session?.user || null;

  let watchlist: watchlist[] = [];
  let attendance: attendance[] = [];
  let followers: following[] = [];
  let following: following[] = [];

  const user = await getUserProfile(username);

  if (user) {
    watchlist = user.watchlist;
    attendance = user.attendance;
    followers = await getFollowers(username);
    following = user.following;
  }

  return {
    props: superjson.serialize({
      attendance,
      following,
      followers,
      sessionUser,
      user,
      watchlist,
    }).json,
  };
}

export default ProfilePage;
