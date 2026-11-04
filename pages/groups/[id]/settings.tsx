import { Box, Container, Link, Stack, Typography } from "@mui/material";
import { GetServerSidePropsContext } from "next";
import Head from "next/head";
import superjson from "superjson";

import GroupSettingsPanel from "../../../src/components/groups/GroupSettingsPanel";
import { getGroupById, getGroupInvites, getGroupMembership } from "../../../src/data/groups";
import { getViewerSession } from "../../../src/utils/viewer";

type Group = NonNullable<Awaited<ReturnType<typeof getGroupById>>>;
type Invite = Awaited<ReturnType<typeof getGroupInvites>>[number];

interface Props {
  group: Group;
  invites: Invite[];
  isOwner: boolean;
  viewerId: number;
}

function GroupSettingsPage({ group, invites, isOwner, viewerId }: Props) {
  return (
    <Box sx={{ background: "#080C14", minHeight: "100vh" }}>
      <Head>
        <title>{group.name} Settings • StageKeeper</title>
      </Head>
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Link
            href={`/groups/${group.id}`}
            sx={{
              fontFamily: '"DM Sans", sans-serif',
              fontSize: "0.62rem",
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "rgba(232,220,200,0.4)",
              "&:hover": { color: "#D4AF55" },
            }}
            underline="none"
          >
            ← Back to {group.name}
          </Link>
        </Box>

        <Stack spacing={1} sx={{ mb: 4 }}>
          <Typography
            sx={{
              fontFamily: '"DM Sans", sans-serif',
              fontSize: "0.62rem",
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "#D4AF55",
            }}
          >
            Settings
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
        </Stack>

        <GroupSettingsPanel group={group} invites={invites} isOwner={isOwner} viewerId={viewerId} />
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
  const membership = await getGroupMembership(groupId, userId);
  if (!membership) {
    return { notFound: true };
  }

  const isOwner = membership.role === "OWNER";
  const [group, invites] = await Promise.all([
    getGroupById(groupId),
    isOwner ? getGroupInvites(groupId) : Promise.resolve([]),
  ]);
  if (!group) return { notFound: true };

  return {
    props: superjson.serialize({
      group,
      invites,
      isOwner,
      viewerId: userId,
    }).json,
  };
}

export default GroupSettingsPage;
