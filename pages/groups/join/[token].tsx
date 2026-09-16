import { Box, Button, Container, Typography } from "@mui/material";
import { GetServerSidePropsContext } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { getSession } from "next-auth/react";
import { useState } from "react";

import { getGroupByInviteToken, getGroupMembership } from "../../../src/data/groups";

interface Props {
  alreadyMember: boolean;
  group: { id: number; name: string; memberCount: number; owner: string | null };
  token: string;
}

function JoinGroupPage({ alreadyMember, group, token }: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function join() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/groups/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(body.error ?? "Could not join.");
        return;
      }
      router.push(`/groups/${body.group.id}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Box sx={{ background: "#080C14", minHeight: "100vh" }}>
      <Head>
        <title>Join {group.name} • StageKeeper</title>
      </Head>
      <Container maxWidth="sm" sx={{ py: 8, textAlign: "center" }}>
        <Typography
          sx={{
            fontFamily: '"DM Sans", sans-serif',
            fontSize: "0.62rem",
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: "#D4AF55",
            mb: 1,
          }}
        >
          You&apos;re invited to
        </Typography>
        <Typography
          sx={{
            fontFamily: '"Cormorant Garamond", serif',
            fontSize: "2.4rem",
            fontWeight: 600,
            color: "#E8DCC8",
            lineHeight: 1.1,
            mb: 1,
          }}
        >
          {group.name}
        </Typography>
        <Typography sx={{ color: "rgba(232,220,200,0.5)", fontSize: "0.9rem", mb: 4 }}>
          {group.memberCount} {group.memberCount === 1 ? "member" : "members"}
          {group.owner ? ` · run by ${group.owner}` : ""}
        </Typography>

        {alreadyMember ? (
          <Button href={`/groups/${group.id}`} variant="contained">
            You&apos;re already in — open the group
          </Button>
        ) : (
          <Button disabled={busy} size="large" variant="contained" onClick={join}>
            {busy ? "Joining…" : "Join group"}
          </Button>
        )}
        {error && (
          <Typography sx={{ color: "#E57373", fontSize: "0.85rem", mt: 2 }}>{error}</Typography>
        )}
      </Container>
    </Box>
  );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const token = String(context.params?.token ?? "");
  if (!/^[0-9a-f-]{36}$/i.test(token)) return { notFound: true };

  const group = await getGroupByInviteToken(token);
  if (!group) return { notFound: true };

  const session = await getSession(context);
  if (!session) {
    // Register (or sign in) and come straight back here.
    const callback = encodeURIComponent(`/groups/join/${token}`);
    return { redirect: { destination: `/register?callbackUrl=${callback}`, permanent: false } };
  }

  const membership = await getGroupMembership(group.id, Number(session.user.id));

  return {
    props: {
      alreadyMember: membership !== null,
      group: {
        id: group.id,
        name: group.name,
        memberCount: group._count.members,
        owner: group.members[0]?.users.username ?? null,
      },
      token,
    },
  };
}

export default JoinGroupPage;
