import { Box, Link, Stack, Typography } from "@mui/material";

import UserAvatar from "../users/UserAvatar";

interface OverlapEntry {
  type: "MUSICAL" | "PLAY";
  showId: number;
  title: string;
  playbill: string;
  members: { id: number; username: string; image: string | null }[];
}

interface Props {
  overlap: OverlapEntry[];
}

function WatchlistOverlap({ overlap }: Props) {
  return (
    <>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2.5 }}>
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
          Shared Watchlist
        </Typography>
        <Box sx={{ flex: 1, height: "1px", background: "rgba(212,175,85,0.2)" }} />
      </Box>

      {overlap.length === 0 ? (
        <Box
          sx={{
            border: "1px solid rgba(212,175,85,0.08)",
            borderRadius: 1,
            py: 4,
            px: 3,
            textAlign: "center",
            background: "rgba(212,175,85,0.02)",
          }}
        >
          <Typography
            sx={{
              fontFamily: '"Cormorant Garamond", serif',
              fontStyle: "italic",
              fontSize: "1rem",
              color: "rgba(232,220,200,0.3)",
              mb: 0.5,
            }}
          >
            No shows yet on more than one watchlist.
          </Typography>
          <Typography
            sx={{
              fontFamily: '"DM Sans", sans-serif',
              fontSize: "0.7rem",
              color: "rgba(232,220,200,0.2)",
              letterSpacing: "0.04em",
            }}
          >
            Add shows to your watchlist to find overlap with the group.
          </Typography>
        </Box>
      ) : (
        <Stack spacing={1.25}>
          {overlap.map((entry) => {
            const showType = entry.type === "MUSICAL" ? "musicals" : "plays";
            const slug = `/${showType}/${entry.title.replace(/\s+/g, "-").toLowerCase()}`;
            return (
              <Link
                key={`${entry.type}-${entry.showId}`}
                href={slug}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  px: 2,
                  py: 1.5,
                  border: "1px solid rgba(212,175,85,0.1)",
                  borderRadius: 1,
                  transition: "border-color 0.2s, background 0.2s",
                  "&:hover": {
                    borderColor: "rgba(212,175,85,0.35)",
                    background: "rgba(212,175,85,0.04)",
                  },
                }}
                underline="none"
              >
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography
                    sx={{
                      fontFamily: '"Cormorant Garamond", serif',
                      fontSize: "1.05rem",
                      fontWeight: 600,
                      color: "#E8DCC8",
                    }}
                  >
                    {entry.title}
                  </Typography>
                  <Typography
                    sx={{
                      fontFamily: '"DM Sans", sans-serif',
                      fontSize: "0.62rem",
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      color: "rgba(212,175,85,0.6)",
                    }}
                  >
                    {entry.members.length} interested · {entry.type.toLowerCase()}
                  </Typography>
                </Box>

                <Stack direction="row" spacing={-1}>
                  {entry.members.slice(0, 5).map((m) => (
                    <Box key={m.id} sx={{ ml: -0.5 }}>
                      <UserAvatar avatarSize="28px" name={m.username} />
                    </Box>
                  ))}
                </Stack>
              </Link>
            );
          })}
        </Stack>
      )}
    </>
  );
}

export default WatchlistOverlap;
