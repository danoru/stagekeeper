import { Box, Container, Divider, Link, Stack, Typography } from "@mui/material";
import { users, following } from "@prisma/client";
import { useRouter } from "next/router";
import superjson from "superjson";

import ProfilePageWrapper from "../../../src/components/users/ProfilePageWrapper";
import UserAvatar from "../../../src/components/users/UserAvatar";
import { findUserByUsername, getUsers, getFollowers } from "../../../src/data/users";

interface Props {
  user: users;
  followers: (following & { users: users })[];
}

interface Params {
  params: { username: string };
}

function NetworkToggle({ username }: { username: string }) {
  const router = useRouter();
  const isFollowing = router.asPath.endsWith("/following");

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
        { label: "Following", href: `/users/${username}/following` },
        { label: "Followers", href: `/users/${username}/followers` },
      ].map((tab) => {
        const active = tab.label === "Followers";
        return (
          <Box
            key={tab.label}
            component="a"
            href={tab.href}
            sx={{
              px: 3,
              py: 1,
              textDecoration: "none",
              background: active ? "rgba(212,175,85,0.12)" : "transparent",
              borderRight: tab.label === "Following" ? "1px solid rgba(212,175,85,0.2)" : "none",
              transition: "background 0.2s",
              "&:hover": { background: active ? "rgba(212,175,85,0.15)" : "rgba(212,175,85,0.05)" },
            }}
          >
            <Typography
              sx={{
                fontFamily: '"DM Sans", sans-serif',
                fontSize: "0.72rem",
                fontWeight: active ? 600 : 400,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: active ? "#D4AF55" : "rgba(232,220,200,0.5)",
              }}
            >
              {tab.label}
            </Typography>
          </Box>
        );
      })}
    </Box>
  );
}

function UserFollowers({ user, followers }: Props) {
  return (
    <ProfilePageWrapper
      title={`${user.username}'s Followers • StageKeeper`}
      username={user.username}
    >
      <Container maxWidth="md" sx={{ py: 4 }}>
        <NetworkToggle username={user.username} />

        {followers.length === 0 ? (
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
              No followers yet.
            </Typography>
          </Box>
        ) : (
          <Stack divider={<Divider sx={{ borderColor: "rgba(212,175,85,0.08)" }} />}>
            {followers.map((follower) => (
              <Stack
                key={follower.users.username}
                direction="row"
                alignItems="center"
                spacing={2}
                sx={{ py: 1.5 }}
              >
                <UserAvatar avatarSize="44px" name={follower.users.username} />
                <Link
                  href={`/users/${follower.users.username}`}
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
                  {follower.users.username}
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
  const followers = await getFollowers(username);
  return {
    props: superjson.serialize({ user, followers }).json,
    revalidate: 1800,
  };
}

export default UserFollowers;
