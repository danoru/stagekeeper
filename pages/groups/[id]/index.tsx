import { Box, Container, Link, Stack, Typography } from "@mui/material";
import { GetServerSidePropsContext } from "next";
import Head from "next/head";
import superjson from "superjson";

import GroupLedger from "../../../src/components/groups/GroupLedger";
import GroupMembers from "../../../src/components/groups/GroupMembers";
import GroupPlans from "../../../src/components/groups/GroupPlans";
import GroupUpcomingFeed from "../../../src/components/groups/GroupUpcomingFeed";
import InviteLinkButton from "../../../src/components/groups/InviteLinkButton";
import WatchlistOverlap from "../../../src/components/groups/WatchlistOverlap";
import WatchlistProgramming from "../../../src/components/groups/WatchlistProgramming";
import { getGroupLedgerVisits } from "../../../src/data/groupLedger";
import {
  getGroupById,
  getGroupPlans,
  getGroupUpcomingAttendance,
  getGroupWatchlist,
  getGroupWatchlistOverlap,
  getGroupWatchlistProgramming,
} from "../../../src/data/groups";
import type { LedgerVisit } from "../../../src/utils/groupLedger";
import { getViewerSession } from "../../../src/utils/viewer";

type Group = NonNullable<Awaited<ReturnType<typeof getGroupById>>>;
type Upcoming = Awaited<ReturnType<typeof getGroupUpcomingAttendance>>;
type Overlap = ReturnType<typeof getGroupWatchlistOverlap>;
type WatchlistRuns = Awaited<ReturnType<typeof getGroupWatchlistProgramming>>;
type Plans = Awaited<ReturnType<typeof getGroupPlans>>;

interface Props {
  group: Group;
  isOwner: boolean;
  upcoming: Upcoming;
  overlap: Overlap;
  watchlistRuns: WatchlistRuns;
  plans: Plans;
  ledgerVisits: LedgerVisit[];
  viewerId: number;
  /** Set when arriving from a show page's "Plan with a group"; opens the form on that show. */
  proposeShowKey: string | null;
}

function GroupDetailPage({
  group,
  isOwner,
  upcoming,
  overlap,
  watchlistRuns,
  plans,
  ledgerVisits,
  viewerId,
  proposeShowKey,
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

          <Stack alignItems="center" direction="row" spacing={2}>
            <InviteLinkButton inviteToken={group.inviteToken} />
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
            initialShowKey={proposeShowKey}
            isOwner={isOwner}
            plans={plans}
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

        <Box sx={{ mb: 5 }}>
          <GroupLedger
            groupName={group.name}
            members={group.members.map((m) => ({ id: m.user, username: m.users.username }))}
            viewerId={viewerId}
            visits={ledgerVisits}
          />
        </Box>
      </Container>
    </Box>
  );
}

export const config = { maxDuration: 30 };

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const session = await getViewerSession(context);
  if (!session) {
    return { redirect: { destination: "/login", permanent: false } };
  }

  const groupId = Number(context.params?.id);
  if (!Number.isFinite(groupId)) {
    return { notFound: true };
  }

  const userId = Number(session.user.id);
  // The group already carries its members, so nothing below needs to look them up again.
  const group = await getGroupById(groupId);
  const membership = group?.members.find((m) => m.user === userId);
  if (!group || !membership) {
    return { notFound: true };
  }
  const memberIds = group.members.map((m) => m.user);

  const [upcoming, watchlist, plans, ledgerVisits] = await Promise.all([
    getGroupUpcomingAttendance(memberIds, userId),
    getGroupWatchlist(memberIds),
    getGroupPlans(groupId),
    getGroupLedgerVisits(memberIds),
  ]);
  const watchlistRuns = await getGroupWatchlistProgramming(watchlist);

  return {
    props: superjson.serialize({
      group,
      isOwner: membership.role === "OWNER",
      upcoming,
      overlap: getGroupWatchlistOverlap(watchlist),
      watchlistRuns,
      plans,
      ledgerVisits,
      viewerId: userId,
      proposeShowKey:
        typeof context.query.propose === "string" &&
        /^(MUSICAL|PLAY)-\d+$/.test(context.query.propose)
          ? context.query.propose
          : null,
    }).json,
  };
}

export default GroupDetailPage;
