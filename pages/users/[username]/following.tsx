import { Box, Container, Divider, Link, Stack, Typography } from "@mui/material";
import { users, following } from "@prisma/client";
import superjson from "superjson";

import ProfilePageWrapper from "../../../src/components/users/ProfilePageWrapper";
import UserAvatar from "../../../src/components/users/UserAvatar";
import { findUserByUsername, getUsers, getFollowing } from "../../../src/data/users";

interface Props {
  user: users;
  following: (following & { users: users })[];
}

interface Params {
  params: { username: string };
}

function NetworkToggle({ username }: { username: string }) {
  return (
    <Box
      sx={{
        display: "inline-flex",
        border: "1px solid rgba(212,175,85,0.2)",
        borderRadius: 1,
        overflow: "hidden",
        mb: 4,
      }}
    >
      {[
        { label: "Following", href: `/users/${username}/following`, active: true },
        { label: "Followers", href: `/users/${username}/followers`, active: false },
      ].map((tab) => (
        <Box
          key={tab.label}
          component="a"
          href={tab.href}
          sx={{
            px: 3,
            py: 1,
            textDecoration: "none",
            background: tab.active ? "rgba(212,175,85,0.12)" : "transparent",
            borderRight: tab.label === "Following" ? "1px solid rgba(212,175,85,0.2)" : "none",
            transition: "background 0.2s",
            "&:hover": {
              background: tab.active ? "rgba(212,175,85,0.15)" : "rgba(212,175,85,0.05)",
            },
          }}
        >
          <Typography
            sx={{
              fontFamily: '"DM Sans", sans-serif',
              fontSize: "0.72rem",
              fontWeight: tab.active ? 600 : 400,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: tab.active ? "#D4AF55" : "rgba(232,220,200,0.5)",
            }}
          >
            {tab.label}
          </Typography>
        </Box>
      ))}
    </Box>
  );
}

function UserFollowingPage({ user, following }: Props) {
  return (
    <ProfilePageWrapper
      title={`${user.username}'s Following • StageKeeper`}
      username={user.username}
    >
      <Container maxWidth="md" sx={{ py: 4 }}>
        <NetworkToggle username={user.username} />

        {!following || following.length === 0 ? (
          <Box
            sx={{
              border: "1px solid rgba(212,175,85,0.08)",
              borderRadius: 1,
              py: 6,
              textAlign: "center",
              background: "rgba(212,175,85,0.02)",
            }}
          >
            <Typography
              sx={{
                fontFamily: '"Cormorant Garamond", serif',
                fontStyle: "italic",
                fontSize: "1.05rem",
                color: "rgba(232,220,200,0.3)",
              }}
            >
              Not following anyone yet.
            </Typography>
          </Box>
        ) : (
          <Stack divider={<Divider sx={{ borderColor: "rgba(212,175,85,0.08)" }} />}>
            {following.map((f) => (
              <Stack
                key={f.followingUsername}
                direction="row"
                alignItems="center"
                spacing={2}
                sx={{ py: 1.5 }}
              >
                <UserAvatar avatarSize="44px" name={f.followingUsername} />
                <Link
                  href={`/users/${f.followingUsername}`}
                  underline="none"
                  sx={{
                    fontFamily: '"DM Sans", sans-serif',
                    fontSize: "0.9rem",
                    color: "#E8DCC8",
                    fontWeight: 500,
                    transition: "color 0.2s",
                    "&:hover": { color: "#D4AF55" },
                  }}
                >
                  {f.followingUsername}
                </Link>
              </Stack>
            ))}
          </Stack>
        )}
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
  const following = await getFollowing(user.id);
  return {
    props: superjson.serialize({ user, following }).json,
    revalidate: 1800,
  };
}

export default UserFollowingPage;
