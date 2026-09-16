import { Box, Container } from "@mui/material";
import { users } from "@prisma/client";
import { GetServerSidePropsContext } from "next";
import superjson from "superjson";

import FriendUpcomingActivity from "../../../src/components/home/FriendUpcomingActivity";
import UpcomingCalendar from "../../../src/components/schedule/UpcomingCalendar";
import ProfilePageWrapper from "../../../src/components/users/ProfilePageWrapper";
import { getUserUpcoming, type NormalizedAttendance } from "../../../src/data/performances";
import { findUserByUsername } from "../../../src/data/users";

interface Props {
  going: NormalizedAttendance[];
  user: users;
}

function UserUpcomingPage({ going, user }: Props) {
  return (
    <ProfilePageWrapper
      title={`${user.username}'s Upcoming • StageKeeper`}
      username={user.username}
    >
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <FriendUpcomingActivity
          emptyHint="Use “I'm going” on a show page (or the Log a show button) to add one."
          emptyTitle="No tickets booked yet."
          title="Going"
          trim={12}
          upcomingPerformances={going}
        />
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

export async function getServerSideProps({ params }: GetServerSidePropsContext) {
  const username = String(params?.username);
  const user = await findUserByUsername(username);
  if (!user) return { notFound: true };
  const going = await getUserUpcoming(user.id);
  return {
    props: superjson.serialize({ user, going }).json,
  };
}

export default UserUpcomingPage;
