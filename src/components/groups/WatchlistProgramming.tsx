import { Box, Link, Stack, Typography } from "@mui/material";
import moment from "moment";

import UserAvatar from "../users/UserAvatar";

interface Member {
  id: number;
  username: string;
  image: string | null;
}

interface Entry {
  id: number;
  type: "MUSICAL" | "PLAY";
  startDate: Date;
  endDate: Date;
  musicals: { title: string; playbill: string } | null;
  plays: { title: string; playbill: string } | null;
  seasons: { theatres: { name: string } } | null;
  interestedMembers: Member[];
}

interface Props {
  entries: Entry[];
}

function formatRunDates(start: Date, end: Date) {
  const now = new Date();
  if (start <= now && end >= now) {
    return `Now playing · through ${moment(end).format("MMM D")}`;
  }
  return `${moment(start).format("MMM D")} – ${moment(end).format("MMM D, YYYY")}`;
}

function WatchlistProgramming({ entries }: Props) {
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
          From The Group&rsquo;s Watchlists
        </Typography>
        <Box sx={{ flex: 1, height: "1px", background: "rgba(212,175,85,0.2)" }} />
      </Box>

      {entries.length === 0 ? (
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
            No upcoming runs match the group&rsquo;s watchlists.
          </Typography>
          <Typography
            sx={{
              fontFamily: '"DM Sans", sans-serif',
              fontSize: "0.7rem",
              color: "rgba(232,220,200,0.2)",
              letterSpacing: "0.04em",
            }}
          >
            Add shows to your watchlist to see when they&rsquo;re scheduled.
          </Typography>
        </Box>
      ) : (
        <Stack spacing={1.25}>
          {entries.map((entry) => {
            const show = entry.type === "MUSICAL" ? entry.musicals : entry.plays;
            if (!show) return null;
            const showType = entry.type === "MUSICAL" ? "musicals" : "plays";
            const slug = `/${showType}/${show.title.replace(/\s+/g, "-").toLowerCase()}`;
            const theatre = entry.seasons?.theatres.name ?? "Theatre TBD";

            return (
              <Link
                key={`${entry.type}-${entry.id}`}
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
                    {show.title}
                  </Typography>
                  <Typography
                    sx={{
                      fontFamily: '"DM Sans", sans-serif',
                      fontSize: "0.7rem",
                      color: "rgba(212,175,85,0.6)",
                    }}
                  >
                    {theatre} · {formatRunDates(entry.startDate, entry.endDate)}
                  </Typography>
                  <Typography
                    sx={{
                      fontFamily: '"DM Sans", sans-serif',
                      fontSize: "0.62rem",
                      letterSpacing: "0.08em",
                      color: "rgba(232,220,200,0.4)",
                      mt: 0.25,
                    }}
                  >
                    On {entry.interestedMembers.length}{" "}
                    {entry.interestedMembers.length === 1 ? "watchlist" : "watchlists"}
                  </Typography>
                </Box>

                <Stack direction="row" spacing={-1}>
                  {entry.interestedMembers.slice(0, 5).map((m) => (
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

export default WatchlistProgramming;
