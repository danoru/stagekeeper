import { Box, Container, Typography } from "@mui/material";
import { users } from "@prisma/client";
import { GetServerSidePropsContext } from "next";
import { getSession } from "next-auth/react";
import superjson from "superjson";

import FriendUpcomingActivity from "../../../src/components/home/FriendUpcomingActivity";
import UpcomingCalendar from "../../../src/components/schedule/UpcomingCalendar";
import ProfilePageWrapper from "../../../src/components/users/ProfilePageWrapper";
import { getUserUpcoming, type NormalizedAttendance } from "../../../src/data/performances";
import { canSeeGoingDates } from "../../../src/data/privacy";
import { findUserByUsername } from "../../../src/data/users";

interface Props {
  canSeeGoing: boolean;
  going: NormalizedAttendance[];
  user: users;
}

function UserUpcomingPage({ canSeeGoing, going, user }: Props) {
  return (
    <ProfilePageWrapper
      title={`${user.username}'s Upcoming • StageKeeper`}
      username={user.username}
    >
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {canSeeGoing ? (
          <FriendUpcomingActivity
            emptyHint="Use “I'm going” on a show page (or the Log a show button) to add one."
            emptyTitle="No tickets booked yet."
            title="Going"
            trim={12}
            upcomingPerformances={going}
          />
        ) : (
          <Typography
            sx={{
              fontFamily: '"Cormorant Garamond", serif',
              fontStyle: "italic",
              color: "rgba(232,220,200,0.55)",
              textAlign: "center",
              py: 3,
            }}
          >
            {`${user.username}'s plans are visible to people they follow back and people in their groups.`}
          </Typography>
        )}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3, mt: 4 }}>
          <Box
            sx={{
              fontFamily: '"DM Sans", sans-serif',
              fontSize: "0.62rem",
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "#D4AF55",
              whiteSpace: "nowrap",
            }}
          >
            On The Calendar
          </Box>
          <Box sx={{ flex: 1, height: "1px", background: "rgba(212,175,85,0.2)" }} />
        </Box>
        <UpcomingCalendar identifier={user.id} />
      </Container>
    </ProfilePageWrapper>
  );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const username = String(context.params?.username);
  const user = await findUserByUsername(username);
  if (!user) return { notFound: true };
  const session = await getSession(context);
  const canSeeGoing = await canSeeGoingDates(session ? Number(session.user.id) : null, user.id);
  const going = canSeeGoing ? await getUserUpcoming(user.id) : [];
  return {
    props: superjson.serialize({ user, going, canSeeGoing }).json,
  };
}

export default UserUpcomingPage;
