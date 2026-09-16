import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";

import type { NormalizedAttendance } from "../../data/performances";
import RecentActivity from "../performances/RecentActivity";

import FriendUpcomingActivity from "./FriendUpcomingActivity";

interface Props {
  myUpcoming: NormalizedAttendance[];
  recentPerformances: NormalizedAttendance[];
  sessionUser: string;
  upcomingPerformances: NormalizedAttendance[];
}

function LoggedInHomePage({
  myUpcoming,
  recentPerformances,
  sessionUser,
  upcomingPerformances,
}: Props) {
  const trim = 5;
  return (
    <Box sx={{ background: "#080C14", minHeight: "100vh" }}>
      <Box
        sx={{
          borderBottom: "1px solid rgba(212,175,85,0.12)",
          background: "linear-gradient(90deg, #0A0F1A, #0D1520, #0A0F1A)",
          py: 2.5,
          textAlign: "center",
        }}
      >
        <Typography
          sx={{
            fontFamily: '"Cormorant Garamond", serif',
            fontSize: "1.1rem",
            fontStyle: "italic",
            color: "rgba(232,220,200,0.6)",
          }}
        >
          Welcome back,{" "}
          <Link
            href={`/users/${sessionUser}`}
            sx={{
              color: "#D4AF55",
              fontStyle: "normal",
              fontWeight: 600,
              "&:hover": { color: "#E8CC80" },
            }}
            underline="none"
          >
            {sessionUser}
          </Link>
          . Here&apos;s what&apos;s been on stage&hellip;
        </Typography>
      </Box>

      <Box sx={{ maxWidth: 1200, mx: "auto", px: { xs: 1.5, md: 3 }, py: 4 }}>
        <FriendUpcomingActivity trim={trim} upcomingPerformances={upcomingPerformances} />
        {myUpcoming.length > 0 && (
          <FriendUpcomingActivity
            emptyHint=""
            emptyTitle=""
            title="Your Upcoming Shows"
            trim={trim}
            upcomingPerformances={myUpcoming}
          />
        )}
        <RecentActivity recentPerformances={recentPerformances} trim={trim} />
      </Box>
    </Box>
  );
}

export default LoggedInHomePage;
