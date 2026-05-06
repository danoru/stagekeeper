import { Box, Container, Divider, Link, Stack, Typography } from "@mui/material";
import { GetServerSidePropsContext } from "next";
import Head from "next/head";
import { getSession } from "next-auth/react";
import superjson from "superjson";

import CreateGroupForm from "../../src/components/groups/CreateGroupForm";
import { getUserGroups } from "../../src/data/groups";

type Membership = Awaited<ReturnType<typeof getUserGroups>>[number];

interface Props {
  memberships: Membership[];
}

function GroupsIndexPage({ memberships }: Props) {
  return (
    <Box sx={{ background: "#080C14", minHeight: "100vh" }}>
      <Head>
        <title>Groups • StageKeeper</title>
      </Head>
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 4 }}>
          <Typography
            sx={{
              fontFamily: '"DM Sans", sans-serif',
              fontSize: "0.62rem",
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "#D4AF55",
              whiteSpace: "nowrap",
            }}
          >
            Your Groups
          </Typography>
          <Box sx={{ flex: 1, height: "1px", background: "rgba(212,175,85,0.2)" }} />
          <Typography
            sx={{
              fontFamily: '"DM Sans", sans-serif',
              fontSize: "0.62rem",
              letterSpacing: "0.1em",
              color: "rgba(232,220,200,0.3)",
              whiteSpace: "nowrap",
            }}
          >
            {memberships.length} {memberships.length === 1 ? "group" : "groups"}
          </Typography>
        </Box>

        {memberships.length === 0 ? (
          <Box
            sx={{
              border: "1px solid rgba(212,175,85,0.08)",
              borderRadius: 1,
              py: 5,
              px: 3,
              textAlign: "center",
              background: "rgba(212,175,85,0.02)",
              mb: 4,
            }}
          >
            <Typography
              sx={{
                fontFamily: '"Cormorant Garamond", serif',
                fontStyle: "italic",
                fontSize: "1rem",
                color: "rgba(232,220,200,0.4)",
                mb: 0.5,
              }}
            >
              No groups yet.
            </Typography>
            <Typography
              sx={{
                fontFamily: '"DM Sans", sans-serif',
                fontSize: "0.7rem",
                color: "rgba(232,220,200,0.3)",
                letterSpacing: "0.04em",
              }}
            >
              Create one below to start planning shows together.
            </Typography>
          </Box>
        ) : (
          <Box
            sx={{
              border: "1px solid rgba(212,175,85,0.1)",
              borderRadius: 1,
              overflow: "hidden",
              mb: 4,
            }}
          >
            <Stack divider={<Divider sx={{ borderColor: "rgba(212,175,85,0.08)" }} />}>
              {memberships.map((m) => (
                <Stack
                  key={m.group}
                  alignItems="center"
                  direction="row"
                  spacing={2}
                  sx={{
                    px: 3,
                    py: 1.75,
                    transition: "background 0.2s",
                    "&:hover": { background: "rgba(212,175,85,0.04)" },
                  }}
                >
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Link
                      href={`/groups/${m.group}`}
                      sx={{
                        fontFamily: '"DM Sans", sans-serif',
                        fontSize: "0.95rem",
                        fontWeight: 500,
                        color: "#E8DCC8",
                        transition: "color 0.2s",
                        "&:hover": { color: "#D4AF55" },
                      }}
                      underline="none"
                    >
                      {m.groups.name}
                    </Link>
                    <Typography
                      sx={{
                        fontFamily: '"DM Sans", sans-serif',
                        fontSize: "0.7rem",
                        color: "rgba(232,220,200,0.35)",
                        mt: 0.25,
                      }}
                    >
                      {m.groups._count.members}{" "}
                      {m.groups._count.members === 1 ? "member" : "members"}
                    </Typography>
                  </Box>

                  {m.role === "OWNER" && (
                    <Box
                      sx={{
                        px: 1.5,
                        py: 0.25,
                        border: "1px solid rgba(212,175,85,0.3)",
                        borderRadius: 0.5,
                        background: "rgba(212,175,85,0.06)",
                      }}
                    >
                      <Typography
                        sx={{
                          fontFamily: '"DM Sans", sans-serif',
                          fontSize: "0.55rem",
                          letterSpacing: "0.12em",
                          textTransform: "uppercase",
                          color: "#D4AF55",
                          fontWeight: 600,
                        }}
                      >
                        Owner
                      </Typography>
                    </Box>
                  )}
                </Stack>
              ))}
            </Stack>
          </Box>
        )}

        <CreateGroupForm />
      </Container>
    </Box>
  );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const session = await getSession(context);
  if (!session) {
    return { redirect: { destination: "/login", permanent: false } };
  }
  const memberships = await getUserGroups(Number(session.user.id));
  return {
    props: superjson.serialize({ memberships }).json,
  };
}

export default GroupsIndexPage;
