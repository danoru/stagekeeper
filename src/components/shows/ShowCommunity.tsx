import { Avatar, Box, Link, Rating, Stack, Tooltip, Typography } from "@mui/material";
import moment from "moment";
import { useEffect, useState } from "react";

import type { FriendGoing, FriendSeen, ShowSummary } from "../../data/showSummary";
import { formatRating } from "../../utils/ratings";
import UserAvatar from "../users/UserAvatar";

interface Props {
  musicalId?: number;
  playId?: number;
  /** Bump to refetch after the viewer logs or edits a visit. */
  version: number;
}

const eyebrowSx = {
  fontFamily: '"DM Sans", sans-serif',
  fontSize: "0.62rem",
  letterSpacing: "0.22em",
  textTransform: "uppercase",
  color: "#D4AF55",
  whiteSpace: "nowrap",
} as const;

const starsSx = {
  "& .MuiRating-iconFilled": { color: "#D4AF55" },
  "& .MuiRating-iconEmpty": { color: "rgba(212,175,85,0.2)" },
};

function FriendAvatar({ username, image }: { username: string; image: string | null }) {
  return image ? (
    <Avatar alt={username} src={image} sx={{ width: 32, height: 32 }} />
  ) : (
    <UserAvatar avatarSize="32px" name={username} />
  );
}

function ShowCommunity({ musicalId, playId, version }: Props) {
  const [summary, setSummary] = useState<ShowSummary | null>(null);

  useEffect(() => {
    const query = musicalId ? `musicalId=${musicalId}` : `playId=${playId}`;
    let cancelled = false;
    fetch(`/api/shows/summary?${query}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!cancelled) setSummary(data);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [musicalId, playId, version]);

  if (!summary) return null;
  const { community, friends } = summary;
  if (community.seenBy === 0 && friends.going.length === 0) return null;

  return (
    <Box sx={{ mt: 4, px: { xs: 2, md: 4 } }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
        <Typography component="h2" sx={eyebrowSx}>
          The Audience
        </Typography>
        <Box sx={{ flex: 1, height: "1px", background: "rgba(212,175,85,0.2)" }} />
      </Box>

      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={{ xs: 2, md: 4 }}
        sx={{ alignItems: { md: "flex-start" } }}
      >
        <Box sx={{ minWidth: 200 }}>
          {community.average != null ? (
            <>
              <Stack alignItems="center" direction="row" spacing={1}>
                <Typography
                  sx={{
                    fontFamily: '"Cormorant Garamond", serif',
                    fontSize: "2rem",
                    lineHeight: 1,
                  }}
                >
                  {formatRating(community.average)}
                </Typography>
                <Rating
                  readOnly
                  precision={0.25}
                  size="small"
                  sx={starsSx}
                  value={community.average}
                />
              </Stack>
              <Typography sx={{ fontSize: "0.75rem", color: "rgba(232,220,200,0.55)" }}>
                {`from ${community.raters} ${community.raters === 1 ? "person" : "people"} · seen by ${community.seenBy}`}
              </Typography>
            </>
          ) : (
            <Typography sx={{ fontSize: "0.8rem", color: "rgba(232,220,200,0.55)" }}>
              {`Seen by ${community.seenBy} ${community.seenBy === 1 ? "person" : "people"} · no ratings yet`}
            </Typography>
          )}
        </Box>

        {friends.seen.length > 0 && <FriendsSeen friends={friends.seen} />}
        {friends.going.length > 0 && <FriendsGoing friends={friends.going} />}
      </Stack>
    </Box>
  );
}

function FriendsSeen({ friends }: { friends: FriendSeen[] }) {
  return (
    <Box>
      <Typography sx={{ fontSize: "0.75rem", color: "rgba(232,220,200,0.55)", mb: 1 }}>
        Friends who&apos;ve seen it
      </Typography>
      <Stack direction="row" sx={{ flexWrap: "wrap", gap: 1.5 }}>
        {friends.map((f) => (
          <Tooltip
            key={f.username}
            title={[
              f.rating != null ? `${formatRating(f.rating)} ★` : "Not rated",
              f.visits > 1 ? `${f.visits} visits` : null,
              f.lastSeen ? moment.utc(f.lastSeen).format("MMM D, YYYY") : null,
            ]
              .filter(Boolean)
              .join(" · ")}
          >
            <Link href={`/users/${f.username}`} sx={{ textAlign: "center" }} underline="none">
              <FriendAvatar image={f.image} username={f.username} />
              {f.rating != null && (
                <Typography sx={{ fontSize: "0.7rem", color: "#D4AF55", mt: 0.25 }}>
                  {formatRating(f.rating)}
                </Typography>
              )}
            </Link>
          </Tooltip>
        ))}
      </Stack>
    </Box>
  );
}

function FriendsGoing({ friends }: { friends: FriendGoing[] }) {
  return (
    <Box>
      <Typography sx={{ fontSize: "0.75rem", color: "rgba(232,220,200,0.55)", mb: 1 }}>
        Friends who are going
      </Typography>
      <Stack spacing={0.75}>
        {friends.map((f) => (
          <Link
            key={`${f.username}-${f.date}`}
            href={`/users/${f.username}`}
            sx={{ display: "flex", alignItems: "center", gap: 1 }}
            underline="none"
          >
            <FriendAvatar image={f.image} username={f.username} />
            <Typography sx={{ fontSize: "0.85rem", color: "rgba(232,220,200,0.85)" }}>
              {f.username}
              <Box component="span" sx={{ color: "rgba(232,220,200,0.5)" }}>
                {` · ${moment.utc(f.date).format("ddd, MMM D")}`}
              </Box>
            </Typography>
          </Link>
        ))}
      </Stack>
    </Box>
  );
}

export default ShowCommunity;
