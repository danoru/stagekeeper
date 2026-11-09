import { Box, Link, Typography } from "@mui/material";

import { resolveShowImage } from "../../utils/gradients";
import { showPath } from "../../utils/slug";
import type { BoardItem, StageBoard } from "../../utils/stageBoard";

interface Props {
  board: StageBoard | null;
  title?: string;
  /** The "N productions across M theatres" line; off where the page already shows the counts. */
  summary?: boolean;
}

const RAILS = [
  { key: "opening", label: "Opening" },
  { key: "lastCall", label: "Last Call" },
  { key: "nowPlaying", label: "Now Playing" },
] as const;

const MAX_PER_RAIL = 12;

const eyebrowSx = {
  fontFamily: '"DM Sans", sans-serif',
  fontSize: "0.62rem",
  letterSpacing: "0.22em",
  textTransform: "uppercase",
  color: "#D4AF55",
  whiteSpace: "nowrap",
} as const;

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;

function BoardCard({ item }: { item: BoardItem }) {
  const { isGradient, value } = resolveShowImage(item.playbill, item.title);
  return (
    <Box component="li" sx={{ flex: "0 0 132px", width: 132, scrollSnapAlign: "start" }}>
      <Link
        href={showPath(item.type === "MUSICAL" ? "musicals" : "plays", item.title)}
        sx={{ display: "block", "&:hover .board-title": { color: "#D4AF55" } }}
        underline="none"
      >
        <Box
          aria-hidden
          sx={{
            aspectRatio: "2 / 3",
            borderRadius: 0.5,
            border: "1px solid",
            borderColor: item.onWatchlist ? "rgba(212,175,85,0.6)" : "rgba(212,175,85,0.15)",
            background: isGradient ? value : `center / cover no-repeat url("${value}")`,
            mb: 1,
          }}
        />
        <Typography
          className="board-title"
          sx={{
            fontFamily: '"Cormorant Garamond", serif',
            fontSize: "1rem",
            fontWeight: 600,
            color: "#E8DCC8",
            lineHeight: 1.15,
            transition: "color 0.2s",
          }}
        >
          {item.title}
        </Typography>
        {item.theatre && (
          <Typography
            sx={{
              fontFamily: '"DM Sans", sans-serif',
              fontSize: "0.68rem",
              color: "rgba(232,220,200,0.45)",
              mt: 0.25,
            }}
          >
            {item.theatre}
          </Typography>
        )}
        <Typography
          sx={{
            fontFamily: '"DM Sans", sans-serif',
            fontSize: "0.68rem",
            color: "rgba(212,175,85,0.8)",
            mt: 0.25,
          }}
        >
          {item.dateLabel}
        </Typography>
        {(item.performancesLeft != null || item.onWatchlist) && (
          <Typography
            sx={{
              fontFamily: '"DM Sans", sans-serif',
              fontSize: "0.64rem",
              color: "rgba(232,220,200,0.45)",
              mt: 0.25,
            }}
          >
            {[
              item.performancesLeft != null &&
                `${plural(item.performancesLeft, "performance")} left`,
              item.onWatchlist && "on your watchlist",
            ]
              .filter(Boolean)
              .join(" · ")}
          </Typography>
        )}
      </Link>
    </Box>
  );
}

/** What's opening, closing soon and playing over the next seven days. */
function WeeklyBoard({ board, title = "This Week on Local Stages", summary = true }: Props) {
  if (!board || board.productions === 0) return null;

  const closingOnWatchlist = board.lastCall.filter((item) => item.onWatchlist);

  return (
    <Box aria-label={title} component="section" sx={{ mb: 5 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: summary ? 1 : 2.5 }}>
        <Typography component="h2" sx={eyebrowSx}>
          {title}
        </Typography>
        <Box sx={{ flex: 1, height: "1px", background: "rgba(212,175,85,0.2)" }} />
      </Box>

      {summary && (
        <Typography
          sx={{
            fontFamily: '"Cormorant Garamond", serif',
            fontStyle: "italic",
            fontSize: "1.05rem",
            color: "rgba(232,220,200,0.6)",
            mb: 2.5,
          }}
        >
          {plural(board.productions, "production")} on stage this week
          {board.theatres > 0 && ` across ${plural(board.theatres, "theatre")}`}.
        </Typography>
      )}

      {closingOnWatchlist.length > 0 && (
        <Box
          sx={{
            border: "1px solid rgba(212,175,85,0.35)",
            borderRadius: 1,
            background: "rgba(212,175,85,0.06)",
            px: 2,
            py: 1.25,
            mb: 2.5,
          }}
        >
          {closingOnWatchlist.map((item) => (
            <Typography key={item.id} sx={{ color: "#E8DCC8", fontSize: "0.9rem" }}>
              On your watchlist:{" "}
              <Link
                href={showPath(item.type === "MUSICAL" ? "musicals" : "plays", item.title)}
                sx={{ color: "#D4AF55", fontWeight: 600 }}
              >
                {item.title}
              </Link>
              {item.theatre && ` at ${item.theatre}`}. {item.dateLabel}
              {item.performancesLeft != null &&
                `, ${plural(item.performancesLeft, "performance")} left`}
              .
            </Typography>
          ))}
        </Box>
      )}

      {RAILS.map(({ key, label }) => {
        const items = board[key];
        if (items.length === 0) return null;
        const shown = items.slice(0, MAX_PER_RAIL);
        return (
          <Box key={key} sx={{ mb: 3 }}>
            <Typography
              component="h3"
              sx={{
                fontFamily: '"DM Sans", sans-serif',
                fontSize: "0.7rem",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "rgba(232,220,200,0.55)",
                mb: 1.25,
              }}
            >
              {label} · {items.length}
            </Typography>
            <Box
              component="ul"
              sx={{
                display: "flex",
                gap: 1.75,
                m: 0,
                p: 0,
                pb: 1,
                listStyle: "none",
                overflowX: "auto",
                scrollSnapType: "x proximity",
              }}
            >
              {shown.map((item) => (
                <BoardCard key={item.id} item={item} />
              ))}
              {items.length > shown.length && (
                <Box
                  component="li"
                  sx={{
                    flex: "0 0 auto",
                    alignSelf: "center",
                    px: 1,
                    fontFamily: '"DM Sans", sans-serif',
                    fontSize: "0.7rem",
                    color: "rgba(232,220,200,0.4)",
                  }}
                >
                  and {items.length - shown.length} more
                </Box>
              )}
            </Box>
          </Box>
        );
      })}
    </Box>
  );
}

export default WeeklyBoard;
