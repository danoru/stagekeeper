import { Box, Container } from "@mui/material";
import { users } from "@prisma/client";
import superjson from "superjson";

import UpcomingCalendar from "../../../src/components/schedule/UpcomingCalendar";
import ProfilePageWrapper from "../../../src/components/users/ProfilePageWrapper";
import { findUserByUsername, getUsers } from "../../../src/data/users";

interface Props {
  user: users;
}

interface Params {
  params: { username: string };
}

function UserUpcomingPage({ user }: Props) {
  return (
    <ProfilePageWrapper
      title={`${user.username}'s Upcoming • StageKeeper`}
      username={user.username}
    >
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
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
            Upcoming Shows
          </Box>
          <Box sx={{ flex: 1, height: "1px", background: "rgba(212,175,85,0.2)" }} />
        </Box>
        <UpcomingCalendar identifier={user.id} />
      </Container>
    </ProfilePageWrapper>
  );
}

export async function getStaticPaths() {
  const users = await getUsers();
  return {
    paths: users.map((user) => ({ params: { username: user.username } })),
    fallback: "blocking",
  };
}

export async function getStaticProps({ params }: Params) {
  const { username } = params;
  const user = await findUserByUsername(username);
  if (!user) return { notFound: true };
  return {
    props: superjson.serialize({ user }).json,
    revalidate: 1800,
  };
}

export default UserUpcomingPage;
