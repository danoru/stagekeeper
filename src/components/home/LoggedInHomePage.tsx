import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";

import RecentActivity from "../performances/RecentActivity";

import FriendUpcomingActivity from "./FriendUpcomingActivity";

interface Props {
  recentPerformances: any;
  sessionUser: string;
  upcomingPerformances: any;
}

function LoggedInHomePage({ recentPerformances, sessionUser, upcomingPerformances }: Props) {
  const trim = 6;
  return (
    <main style={{ marginTop: "20px", textAlign: "center" }}>
      <Typography variant="h6">
        Welcome back,{" "}
        <Link href={`/users/${sessionUser}`} underline="none">
          {sessionUser}
        </Link>
        . Here&apos;s what your friends have been watching...
      </Typography>
      <FriendUpcomingActivity upcomingPerformances={upcomingPerformances} trim={trim} />
      <RecentActivity recentPerformances={recentPerformances} trim={trim} />
    </main>
  );
}

export default LoggedInHomePage;
