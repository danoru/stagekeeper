import { Box, Container, Divider, Link, Stack, Typography } from "@mui/material";
import { users } from "@prisma/client";
import Head from "next/head";
import superjson from "superjson";

import UserAvatar from "../../src/components/users/UserAvatar";
import { getUsers } from "../../src/data/users";

interface Props {
  users: users[];
}

function UsersPage({ users }: Props) {
  const filteredUsers = users.filter((user) => user.username !== "guest");

  return (
    <Box sx={{ background: "#080C14", minHeight: "100vh" }}>
      <Head>
        <title>Members • StageKeeper</title>
      </Head>
      <Container maxWidth="md" sx={{ py: 4 }}>
        {/* Page header */}
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
            Members
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
            {filteredUsers.length} {filteredUsers.length === 1 ? "member" : "members"}
          </Typography>
        </Box>

        <Box
          sx={{
            border: "1px solid rgba(212,175,85,0.1)",
            borderRadius: 1,
            overflow: "hidden",
          }}
        >
          <Stack divider={<Divider sx={{ borderColor: "rgba(212,175,85,0.08)" }} />}>
            {filteredUsers.map((user) => (
              <Stack
                key={user.username}
                direction="row"
                alignItems="center"
                spacing={2}
                sx={{
                  px: 3,
                  py: 1.75,
                  transition: "background 0.2s",
                  "&:hover": { background: "rgba(212,175,85,0.04)" },
                }}
              >
                <UserAvatar avatarSize="40px" name={user.username} />

                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Link
                    href={`/users/${user.username}`}
                    underline="none"
                    sx={{
                      fontFamily: '"DM Sans", sans-serif',
                      fontSize: "0.9rem",
                      fontWeight: 500,
                      color: "#E8DCC8",
                      transition: "color 0.2s",
                      "&:hover": { color: "#D4AF55" },
                    }}
                  >
                    {user.username}
                  </Link>
                  {(user.firstName || user.lastName) && (
                    <Typography
                      sx={{
                        fontFamily: '"DM Sans", sans-serif',
                        fontSize: "0.72rem",
                        color: "rgba(232,220,200,0.35)",
                        mt: 0.1,
                      }}
                    >
                      {[user.firstName, user.lastName].filter(Boolean).join(" ")}
                    </Typography>
                  )}
                </Box>

                {/* Badge chip for ADMIN / PATRON */}
                {user.badge !== "USER" && (
                  <Box
                    sx={{
                      px: 1.5,
                      py: 0.25,
                      border: "1px solid",
                      borderColor:
                        user.badge === "ADMIN" ? "rgba(207,68,68,0.4)" : "rgba(212,175,85,0.3)",
                      borderRadius: 0.5,
                      background:
                        user.badge === "ADMIN" ? "rgba(207,68,68,0.08)" : "rgba(212,175,85,0.06)",
                    }}
                  >
                    <Typography
                      sx={{
                        fontFamily: '"DM Sans", sans-serif',
                        fontSize: "0.55rem",
                        letterSpacing: "0.12em",
                        textTransform: "uppercase",
                        color: user.badge === "ADMIN" ? "#CF4444" : "#D4AF55",
                        fontWeight: 600,
                      }}
                    >
                      {user.badge}
                    </Typography>
                  </Box>
                )}

                {/* Quick links */}
                <Stack direction="row" spacing={2}>
                  {[
                    { label: "Musicals", href: `/users/${user.username}/musicals` },
                    { label: "Plays", href: `/users/${user.username}/plays` },
                    { label: "Watchlist", href: `/users/${user.username}/watchlist` },
                    { label: "Likes", href: `/users/${user.username}/likes` },
                  ].map((link) => (
                    <Link
                      key={link.label}
                      href={link.href}
                      underline="none"
                      sx={{
                        fontFamily: '"DM Sans", sans-serif',
                        fontSize: "0.62rem",
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                        color: "rgba(232,220,200,0.3)",
                        transition: "color 0.2s",
                        "&:hover": { color: "#D4AF55" },
                        display: { xs: "none", sm: "block" },
                      }}
                    >
                      {link.label}
                    </Link>
                  ))}
                </Stack>
              </Stack>
            ))}
          </Stack>
        </Box>
      </Container>
    </Box>
  );
}

export async function getStaticProps() {
  const users = await getUsers();
  return {
    props: superjson.serialize({ users }).json,
    revalidate: 1800,
  };
}

export default UsersPage;
