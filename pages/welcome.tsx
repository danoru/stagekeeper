import CheckIcon from "@mui/icons-material/Check";
import { Box, Button, Chip, Container, Grid, Stack, TextField, Typography } from "@mui/material";
import { GetServerSidePropsContext } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { getSession } from "next-auth/react";
import { useState } from "react";
import superjson from "superjson";

import LogShowDialog from "../src/components/shows/LogShowDialog";
import UserAvatar from "../src/components/users/UserAvatar";
import prisma from "../src/data/db";
import { getUserGroups } from "../src/data/groups";
import { getStarterShows, getSuggestedPeople, type StarterShow } from "../src/data/onboarding";
import { resolveShowImage } from "../src/utils/gradients";

type Person = Awaited<ReturnType<typeof getSuggestedPeople>>[number];

interface Props {
  groups: { id: number; name: string }[];
  people: Person[];
  starterShows: StarterShow[];
  username: string;
}

const STEPS = ["Shows you've seen", "People to follow", "Your group"] as const;

const eyebrowSx = {
  fontFamily: '"DM Sans", sans-serif',
  fontSize: "0.62rem",
  letterSpacing: "0.22em",
  textTransform: "uppercase",
  color: "#D4AF55",
};

const headingSx = {
  fontFamily: '"Cormorant Garamond", serif',
  fontSize: { xs: "1.8rem", md: "2.4rem" },
  fontWeight: 600,
  color: "#E8DCC8",
  lineHeight: 1.1,
};

const bodySx = { color: "rgba(232,220,200,0.55)", fontSize: "0.95rem" };

function WelcomePage({ groups, people, starterShows, username }: Props) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [seen, setSeen] = useState<Set<string>>(new Set());
  const [pending, setPending] = useState<Set<string>>(new Set());
  const [logOpen, setLogOpen] = useState(false);
  const [extraLogged, setExtraLogged] = useState<string[]>([]);
  const [followed, setFollowed] = useState<Set<string>>(
    new Set(people.filter((p) => p.isFollowing).map((p) => p.username))
  );
  const [groupName, setGroupName] = useState("");
  const [createdGroup, setCreatedGroup] = useState<{ id: number; name: string } | null>(null);
  const [groupError, setGroupError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function toggleSeen(show: StarterShow) {
    const key = `${show.type}-${show.id}`;
    if (seen.has(key) || pending.has(key)) return;
    setPending((s) => new Set(s).add(key));
    try {
      const res = await fetch("/api/shows/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: show.type,
          musicalId: show.type === "MUSICAL" ? show.id : undefined,
          playId: show.type === "PLAY" ? show.id : undefined,
        }),
      });
      if (res.ok) setSeen((s) => new Set(s).add(key));
    } finally {
      setPending((s) => {
        const next = new Set(s);
        next.delete(key);
        return next;
      });
    }
  }

  async function toggleFollow(person: Person) {
    const isFollowing = followed.has(person.username);
    const res = await fetch("/api/user/follow", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        followingUsername: person.username,
        action: isFollowing ? "unfollow" : "follow",
      }),
    });
    if (!res.ok) return;
    setFollowed((s) => {
      const next = new Set(s);
      if (isFollowing) next.delete(person.username);
      else next.add(person.username);
      return next;
    });
  }

  async function createGroup(e: React.FormEvent) {
    e.preventDefault();
    if (!groupName.trim()) return;
    setBusy(true);
    setGroupError(null);
    try {
      const res = await fetch("/api/groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: groupName.trim() }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setGroupError(body.error ?? "Could not create group.");
        return;
      }
      setCreatedGroup({ id: body.group.id, name: body.group.name });
    } finally {
      setBusy(false);
    }
  }

  async function finish(destination = "/") {
    setBusy(true);
    try {
      await fetch("/api/user/onboarding", { method: "POST" });
    } finally {
      router.push(destination);
    }
  }

  const loggedCount = seen.size + extraLogged.length;
  const firstGroup = createdGroup ?? groups[0] ?? null;

  return (
    <Box sx={{ background: "#080C14", minHeight: "100vh" }}>
      <Head>
        <title>Welcome • StageKeeper</title>
      </Head>
      <Container maxWidth="md" sx={{ py: { xs: 4, md: 6 } }}>
        {/* Progress */}
        <Stack direction="row" spacing={1} sx={{ mb: 4 }}>
          {STEPS.map((label, i) => (
            <Box key={label} sx={{ flex: 1 }}>
              <Box
                sx={{
                  height: 2,
                  background: i <= step ? "#D4AF55" : "rgba(212,175,85,0.15)",
                  mb: 1,
                }}
              />
              <Typography
                sx={{
                  ...eyebrowSx,
                  color: i === step ? "#D4AF55" : "rgba(232,220,200,0.3)",
                  display: { xs: i === step ? "block" : "none", sm: "block" },
                }}
              >
                {i + 1}. {label}
              </Typography>
            </Box>
          ))}
        </Stack>

        {step === 0 && (
          <>
            <Typography sx={eyebrowSx}>Welcome, {username}</Typography>
            <Typography sx={{ ...headingSx, mt: 1, mb: 1.5 }}>
              Which of these have you seen?
            </Typography>
            <Typography sx={{ ...bodySx, mb: 3 }}>
              Tap any you&apos;ve been to — you can add dates and ratings later. Don&apos;t see one?
              Search for it, or add it yourself.
            </Typography>

            <Grid container spacing={1.5} sx={{ mb: 3 }}>
              {starterShows.map((show) => {
                const key = `${show.type}-${show.id}`;
                const isSeen = seen.has(key);
                const { isGradient, value } = resolveShowImage(show.playbill, show.title);
                return (
                  <Grid key={key} size={{ xs: 4, sm: 3, md: 2 }}>
                    <Box
                      role="button"
                      sx={{
                        position: "relative",
                        aspectRatio: "2 / 3",
                        borderRadius: 1,
                        overflow: "hidden",
                        cursor: "pointer",
                        border: "2px solid",
                        borderColor: isSeen ? "#D4AF55" : "rgba(212,175,85,0.12)",
                        background: isGradient ? value : `url(${value}) center/cover`,
                        opacity: pending.has(key) ? 0.6 : 1,
                        transition: "border-color 0.2s, transform 0.2s",
                        "&:hover": { transform: "translateY(-2px)" },
                      }}
                      tabIndex={0}
                      onClick={() => toggleSeen(show)}
                      onKeyDown={(e) => e.key === "Enter" && toggleSeen(show)}
                    >
                      <Box
                        sx={{
                          position: "absolute",
                          inset: 0,
                          background:
                            "linear-gradient(180deg, rgba(8,12,20,0) 40%, rgba(8,12,20,0.9) 100%)",
                        }}
                      />
                      {isSeen && (
                        <Box
                          sx={{
                            position: "absolute",
                            top: 6,
                            right: 6,
                            width: 22,
                            height: 22,
                            borderRadius: "50%",
                            background: "#D4AF55",
                            color: "#0D1520",
                            display: "grid",
                            placeItems: "center",
                          }}
                        >
                          <CheckIcon sx={{ fontSize: 16 }} />
                        </Box>
                      )}
                      <Typography
                        sx={{
                          position: "absolute",
                          left: 8,
                          right: 8,
                          bottom: 8,
                          fontFamily: '"Cormorant Garamond", serif',
                          fontSize: "0.9rem",
                          fontWeight: 600,
                          color: "#E8DCC8",
                          lineHeight: 1.15,
                        }}
                      >
                        {show.title}
                      </Typography>
                    </Box>
                  </Grid>
                );
              })}
            </Grid>

            <Stack direction="row" flexWrap="wrap" spacing={1} sx={{ mb: 4, gap: 1 }}>
              <Button variant="outlined" onClick={() => setLogOpen(true)}>
                Search or add another show
              </Button>
              {extraLogged.map((t) => (
                <Chip key={t} color="primary" label={t} size="small" variant="outlined" />
              ))}
            </Stack>

            <Stack direction="row" justifyContent="space-between">
              <Button sx={{ color: "rgba(232,220,200,0.4)" }} onClick={() => finish()}>
                Skip for now
              </Button>
              <Button variant="contained" onClick={() => setStep(1)}>
                {loggedCount > 0 ? `Next (${loggedCount} logged)` : "Next"}
              </Button>
            </Stack>

            <LogShowDialog
              open={logOpen}
              onClose={() => setLogOpen(false)}
              onLogged={({ show }) => setExtraLogged((l) => [...l, show.title])}
            />
          </>
        )}

        {step === 1 && (
          <>
            <Typography sx={eyebrowSx}>Step 2</Typography>
            <Typography sx={{ ...headingSx, mt: 1, mb: 1.5 }}>Follow a few people</Typography>
            <Typography sx={{ ...bodySx, mb: 3 }}>
              Their shows and plans show up on your home page. Everyone here so far:
            </Typography>

            <Stack spacing={1} sx={{ mb: 4 }}>
              {people.length === 0 && (
                <Typography sx={bodySx}>
                  You&apos;re the first one here. Invite a friend!
                </Typography>
              )}
              {people.map((person) => {
                const isFollowing = followed.has(person.username);
                return (
                  <Stack
                    key={person.id}
                    alignItems="center"
                    direction="row"
                    spacing={2}
                    sx={{
                      px: 2,
                      py: 1.25,
                      border: "1px solid rgba(212,175,85,0.1)",
                      borderRadius: 1,
                    }}
                  >
                    <UserAvatar avatarSize="36px" name={person.username} />
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography sx={{ color: "#E8DCC8", fontSize: "0.9rem", fontWeight: 500 }}>
                        {person.username}
                      </Typography>
                      <Typography sx={{ color: "rgba(232,220,200,0.4)", fontSize: "0.72rem" }}>
                        {person._count.attendance} show{person._count.attendance === 1 ? "" : "s"}{" "}
                        logged
                      </Typography>
                    </Box>
                    <Button
                      size="small"
                      variant={isFollowing ? "contained" : "outlined"}
                      onClick={() => toggleFollow(person)}
                    >
                      {isFollowing ? "Following" : "Follow"}
                    </Button>
                  </Stack>
                );
              })}
            </Stack>

            <Stack direction="row" justifyContent="space-between">
              <Button sx={{ color: "rgba(232,220,200,0.4)" }} onClick={() => setStep(0)}>
                Back
              </Button>
              <Button variant="contained" onClick={() => setStep(2)}>
                Next
              </Button>
            </Stack>
          </>
        )}

        {step === 2 && (
          <>
            <Typography sx={eyebrowSx}>Step 3</Typography>
            <Typography sx={{ ...headingSx, mt: 1, mb: 1.5 }}>
              {firstGroup ? "You're in a group" : "Start a group"}
            </Typography>
            <Typography sx={{ ...bodySx, mb: 3 }}>
              {firstGroup
                ? `${firstGroup.name} is where you'll plan outings together — poll dates, see who's going, and spot the shows everyone wants to see.`
                : "Groups are for the people you actually go to shows with. Poll dates, see who's going, and spot the shows everyone wants to see. Name it, then share the invite link."}
            </Typography>

            {!firstGroup && (
              <Box component="form" sx={{ mb: 4 }} onSubmit={createGroup}>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                  <TextField
                    fullWidth
                    inputProps={{ maxLength: 60 }}
                    placeholder="e.g. Tuesday Matinee Crew"
                    size="small"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                  />
                  <Button
                    disabled={busy || !groupName.trim()}
                    sx={{ whiteSpace: "nowrap" }}
                    type="submit"
                    variant="outlined"
                  >
                    Create group
                  </Button>
                </Stack>
                {groupError && (
                  <Typography sx={{ color: "#E57373", fontSize: "0.8rem", mt: 1 }}>
                    {groupError}
                  </Typography>
                )}
              </Box>
            )}

            <Stack direction="row" justifyContent="space-between">
              <Button sx={{ color: "rgba(232,220,200,0.4)" }} onClick={() => setStep(1)}>
                Back
              </Button>
              <Button
                disabled={busy}
                variant="contained"
                onClick={() => finish(firstGroup ? `/groups/${firstGroup.id}` : "/")}
              >
                {firstGroup ? "Open the group" : "Finish"}
              </Button>
            </Stack>
          </>
        )}
      </Container>
    </Box>
  );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const session = await getSession(context);
  if (!session) {
    return { redirect: { destination: "/register", permanent: false } };
  }
  const userId = Number(session.user.id);
  const user = await prisma.users.findUnique({
    where: { id: userId },
    select: { username: true },
  });
  if (!user) return { redirect: { destination: "/login", permanent: false } };

  const [starterShows, people, memberships] = await Promise.all([
    getStarterShows(),
    getSuggestedPeople(userId),
    getUserGroups(userId),
  ]);

  return {
    props: superjson.serialize({
      groups: memberships.map((m) => ({ id: m.groups.id, name: m.groups.name })),
      people,
      starterShows,
      username: user.username,
    }).json,
  };
}

export default WelcomePage;
