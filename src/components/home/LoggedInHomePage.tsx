import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import FriendUpcomingActivity from "./FriendUpcomingActivity";
import RecentActivity from "../performances/RecentActivity";

interface Props {
  recentPerformances: any;
  sessionUser: string;
  upcomingPerformances: any;
}

function LoggedInHomePage({
  recentPerformances,
  sessionUser,
  upcomingPerformances,
}: Props) {
  return (
    <main style={{ marginTop: "20px", textAlign: "center" }}>
      <Typography variant="h6">
        Welcome back,{" "}
        <Link href={`/users/${sessionUser}`} underline="none">
          {sessionUser}
        </Link>
        . Here&apos;s what your friends have been watching...
      </Typography>
      <FriendUpcomingActivity upcomingPerformances={upcomingPerformances} />
      <RecentActivity recentPerformances={recentPerformances} trim={5} />
    </main>
  );
}

export default LoggedInHomePage;
