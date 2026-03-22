import MusicNoteIcon from "@mui/icons-material/MusicNote";
import TheaterComedyIcon from "@mui/icons-material/TheaterComedy";
import Badge from "@mui/material/Badge";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import Link from "@mui/material/Link";
import Rating from "@mui/material/Rating";
import Typography from "@mui/material/Typography";
import type { PerformanceType } from "@prisma/client";
import moment from "moment";

import { resolveShowImage } from "../../utils/gradients";

interface Props {
  comment?: string | null;
  date: Date;
  image: string;
  rating?: number | null;
  show: string;
  theatre: string;
  type: PerformanceType;
  username?: string;
  sx: any;
}

function DetailInfoCard(card: Props) {
  const isMusical = card.type === "MUSICAL";
  const showType = isMusical ? "musicals" : "plays";
  const slug = `/${showType}/${card.show.replace(/\s+/g, "-").toLowerCase()}`;
  const { isGradient, value } = resolveShowImage(card.image, card.show);

  return (
    <Grid sx={{ margin: "4px" }}>
      <Card
        sx={{
          position: "relative",
          height: "270px",
          width: "211.5px",
          overflow: "hidden",
          border: "1px solid rgba(212,175,85,0.1)",
          transition: "border-color 0.3s, transform 0.3s, box-shadow 0.3s",
          "&:hover": {
            borderColor: "rgba(212,175,85,0.35)",
            transform: "translateY(-4px)",
            boxShadow: "0 16px 40px rgba(0,0,0,0.55), 0 0 0 1px rgba(212,175,85,0.2)",
            ".detail-image": { filter: "brightness(0.75)" },
            ".detail-overlay": { borderColor: "rgba(212,175,85,0.55)" },
            ".detail-title": { color: "#D4AF55" },
          },
        }}
      >
        <Link href={slug} underline="none" sx={{ display: "block", height: "100%" }}>
          {/* Background */}
          {isGradient ? (
            <Box
              className="detail-image"
              sx={{
                position: "absolute",
                inset: 0,
                background: value,
                transition: "filter 0.3s",
              }}
            />
          ) : (
            <Box
              className="detail-image"
              sx={{
                position: "absolute",
                inset: 0,
                backgroundImage: `url(${card.image})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                filter: "brightness(0.55)",
                transition: "filter 0.3s",
              }}
            />
          )}

          {/* Gold top line */}
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "2px",
              background: "linear-gradient(90deg, transparent, rgba(212,175,85,0.5), transparent)",
              pointerEvents: "none",
            }}
          />

          {/* Inner border */}
          <Box
            className="detail-overlay"
            sx={{
              position: "absolute",
              top: "6px",
              right: "6px",
              bottom: "6px",
              left: "6px",
              border: "1px solid rgba(212,175,85,0.2)",
              pointerEvents: "none",
              transition: "border-color 0.3s",
            }}
          />

          {/* Bottom gradient + info */}
          <Box
            sx={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              background:
                "linear-gradient(to top, rgba(8,12,20,0.98) 0%, rgba(8,12,20,0.75) 60%, transparent 100%)",
              p: "28px 12px 10px",
            }}
          >
            <Typography
              className="detail-title"
              sx={{
                fontFamily: '"Cormorant Garamond", serif',
                fontSize: "0.95rem",
                fontWeight: 600,
                color: "#E8DCC8",
                lineHeight: 1.2,
                transition: "color 0.3s",
                mb: 0.25,
              }}
            >
              {card.show}
            </Typography>
            <Typography
              sx={{
                fontFamily: '"DM Sans", sans-serif',
                fontSize: "0.6rem",
                letterSpacing: "0.06em",
                color: "rgba(212,175,85,0.6)",
                mb: 0.25,
              }}
            >
              {card.theatre} · {moment(card.date).format("MMM D")}
            </Typography>
            {card.username && (
              <Typography
                sx={{
                  fontFamily: '"DM Sans", sans-serif',
                  fontSize: "0.58rem",
                  fontStyle: "italic",
                  color: "rgba(232,220,200,0.45)",
                  mb: 0.25,
                }}
              >
                {card.username}
              </Typography>
            )}
            {card.rating != null && (
              <Rating
                readOnly
                size="small"
                value={card.rating}
                sx={{
                  "& .MuiRating-iconFilled": { color: "#D4AF55" },
                  "& .MuiRating-iconEmpty": { color: "rgba(212,175,85,0.2)" },
                  fontSize: "0.75rem",
                  mb: 0.25,
                }}
              />
            )}
            {card.comment && (
              <Typography
                sx={{
                  fontFamily: '"Cormorant Garamond", serif',
                  fontStyle: "italic",
                  fontSize: "0.72rem",
                  color: "rgba(232,220,200,0.6)",
                  lineHeight: 1.3,
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
              >
                &ldquo;{card.comment}&rdquo;
              </Typography>
            )}
          </Box>
        </Link>
      </Card>
    </Grid>
  );
}

export default DetailInfoCard;
