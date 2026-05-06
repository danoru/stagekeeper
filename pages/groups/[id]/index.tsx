import { Box, Container, Link, Stack, Typography } from "@mui/material";
import { GetServerSidePropsContext } from "next";
import Head from "next/head";
import { getSession } from "next-auth/react";
import superjson from "superjson";

import GroupMembers from "../../../src/components/groups/GroupMembers";
import GroupPlans from "../../../src/components/groups/GroupPlans";
import GroupUpcomingFeed from "../../../src/components/groups/GroupUpcomingFeed";
import WatchlistOverlap from "../../../src/components/groups/WatchlistOverlap";
import WatchlistProgramming from "../../../src/components/groups/WatchlistProgramming";
import {
  getGroupById,
  getGroupMembership,
  getGroupPlans,
  getGroupUpcomingAttendance,
  getGroupWatchlistOverlap,
  getGroupWatchlistProgramming,
  getUpcomingProgrammingForPicker,
} from "../../../src/data/groups";

type Group = NonNullable<Awaited<ReturnType<typeof getGroupById>>>;
type Upcoming = Awaited<ReturnType<typeof getGroupUpcomingAttendance>>;
type Overlap = Awaited<ReturnType<typeof getGroupWatchlistOverlap>>;
type WatchlistRuns = Awaited<ReturnType<typeof getGroupWatchlistProgramming>>;
type Plans = Awaited<ReturnType<typeof getGroupPlans>>;
type ProgOptions = Awaited<ReturnType<typeof getUpcomingProgrammingForPicker>>;

interface Props {
  group: Group;
  isOwner: boolean;
  upcoming: Upcoming;
  overlap: Overlap;
  watchlistRuns: WatchlistRuns;
  plans: Plans;
  programmingOptions: ProgOptions;
  viewerId: number;
}

function GroupDetailPage({
  group,
  isOwner,
  upcoming,
  overlap,
  watchlistRuns,
  plans,
  programmingOptions,
  viewerId,
}: Props) {
  return (
    <Box sx={{ background: "#080C14", minHeight: "100vh" }}>
      <Head>
        <title>{group.name} • StageKeeper</title>
      </Head>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Stack
          alignItems={{ xs: "flex-start", sm: "center" }}
          direction={{ xs: "column", sm: "row" }}
          spacing={1}
          sx={{ mb: 4 }}
        >
          <Box sx={{ flex: 1 }}>
            <Typography
              sx={{
                fontFamily: '"DM Sans", sans-serif',
                fontSize: "0.62rem",
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                color: "#D4AF55",
                mb: 0.5,
              }}
            >
              Group
            </Typography>
            <Typography
              sx={{
                fontFamily: '"Cormorant Garamond", serif',
                fontSize: "2rem",
                fontWeight: 600,
                color: "#E8DCC8",
                lineHeight: 1.1,
              }}
            >
              {group.name}
            </Typography>
          </Box>

          <Stack direction="row" spacing={2}>
            <Link
              href={`/groups/${group.id}/settings`}
              sx={{
                fontFamily: '"DM Sans", sans-serif',
                fontSize: "0.7rem",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "rgba(232,220,200,0.5)",
                "&:hover": { color: "#D4AF55" },
              }}
              underline="none"
            >
              {isOwner ? "Manage" : "Settings"}
            </Link>
          </Stack>
        </Stack>

        <Box sx={{ mb: 5 }}>
          <GroupMembers members={group.members} />
        </Box>

        <Box sx={{ mb: 5 }}>
          <GroupPlans
            groupId={group.id}
            isOwner={isOwner}
            plans={plans}
            programmingOptions={programmingOptions}
            viewerId={viewerId}
          />
        </Box>

        <Box sx={{ mb: 5 }}>
          <GroupUpcomingFeed upcoming={upcoming} />
        </Box>

        <Box sx={{ mb: 5 }}>
          <WatchlistProgramming entries={watchlistRuns} />
        </Box>

        <Box sx={{ mb: 5 }}>
          <WatchlistOverlap overlap={overlap} />
        </Box>
      </Container>
    </Box>
  );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const session = await getSession(context);
  if (!session) {
    return { redirect: { destination: "/login", permanent: false } };
  }

  const groupId = Number(context.params?.id);
  if (!Number.isFinite(groupId)) {
    return { notFound: true };
  }

  const userId = Number(session.user.id);
  const membership = await getGroupMembership(groupId, userId);
  if (!membership) {
    return { notFound: true };
  }

  const [group, upcoming, overlap, watchlistRuns, plans, programmingOptions] =
    await Promise.all([
      getGroupById(groupId),
      getGroupUpcomingAttendance(groupId),
      getGroupWatchlistOverlap(groupId),
      getGroupWatchlistProgramming(groupId),
      getGroupPlans(groupId),
      getUpcomingProgrammingForPicker(),
    ]);

  if (!group) return { notFound: true };

  return {
    props: superjson.serialize({
      group,
      isOwner: membership.role === "OWNER",
      upcoming,
      overlap,
      watchlistRuns,
      plans,
      programmingOptions,
      viewerId: userId,
    }).json,
  };
}

export default GroupDetailPage;
