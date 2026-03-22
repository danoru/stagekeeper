import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import type { musicals, plays, watchlist } from "@prisma/client";

import { resolveShowImage } from "../../utils/gradients";

interface WatchlistProps {
  username: string;
  watchlist: (watchlist & {
    musicals: musicals;
    plays: plays;
  })[];
}

interface CardProps {
  title: string;
  playbill: string;
  type: "musical" | "play";
}

function UserWatchlistPreview({ username, watchlist }: WatchlistProps) {
  if (!watchlist || watchlist.length === 0) return null;

  // Get items with a valid show title (musicals or plays)
  const items = watchlist.filter((item) => item.musicals?.title || item.plays?.title).slice(0, 4);

  return (
    <Box>
      {/* Section header */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
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
          Watchlist
        </Typography>
        <Box sx={{ flex: 1, height: "1px", background: "rgba(212,175,85,0.2)" }} />
        <Link
          href={`/users/${username}/watchlist`}
          underline="none"
          sx={{
            fontFamily: '"DM Sans", sans-serif',
            fontSize: "0.6rem",
            letterSpacing: "0.1em",
            color: "rgba(212,175,85,0.5)",
            whiteSpace: "nowrap",
            transition: "color 0.2s",
            "&:hover": { color: "#D4AF55" },
          }}
        >
          {watchlist.length} total →
        </Link>
      </Box>

      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
        {items.map((item, i) => {
          const isMusical = !!item.musicals?.title;
          const title = isMusical ? item.musicals.title : item.plays?.title;
          const playbill = isMusical ? item.musicals.playbill : item.plays?.playbill;
          return (
            <TinyCard
              key={`card-${i}`}
              playbill={playbill ?? ""}
              title={title ?? ""}
              type={isMusical ? "musical" : "play"}
            />
          );
        })}
      </Box>
    </Box>
  );
}

function TinyCard({ title, playbill, type }: CardProps) {
  const slug = `/${type === "musical" ? "musicals" : "plays"}/${title.replace(/\s+/g, "-").toLowerCase()}`;
  const { isGradient, value } = resolveShowImage(playbill, title);

  return (
    <Tooltip title={title} placement="top">
      <Box
        component="a"
        href={slug}
        sx={{
          position: "relative",
          display: "block",
          height: "108px",
          width: "70px",
          borderRadius: 0.5,
          overflow: "hidden",
          border: "1px solid rgba(212,175,85,0.12)",
          textDecoration: "none",
          flexShrink: 0,
          transition: "border-color 0.3s, transform 0.3s",
          "&:hover": {
            borderColor: "rgba(212,175,85,0.4)",
            transform: "translateY(-3px)",
            "& .tiny-image": { filter: "brightness(0.8)" },
            "& .tiny-overlay": { borderColor: "rgba(212,175,85,0.5)" },
          },
        }}
      >
        {isGradient ? (
          <Box
            className="tiny-image"
            sx={{
              position: "absolute",
              inset: 0,
              background: value,
              transition: "filter 0.3s",
            }}
          />
        ) : (
          <Box
            className="tiny-image"
            sx={{
              position: "absolute",
              inset: 0,
              backgroundImage: `url(${value})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              filter: "brightness(0.6)",
              transition: "filter 0.3s",
            }}
          />
        )}
        <Box
          className="tiny-overlay"
          sx={{
            position: "absolute",
            top: "4px",
            right: "4px",
            bottom: "4px",
            left: "4px",
            border: "1px solid rgba(212,175,85,0.2)",
            pointerEvents: "none",
            transition: "border-color 0.3s",
          }}
        />
      </Box>
    </Tooltip>
  );
}

export default UserWatchlistPreview;
