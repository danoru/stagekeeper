import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Chip from "@mui/material/Chip";
import Grid from "@mui/material/Grid";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import type { PerformanceType } from "@prisma/client";
import moment from "moment";

import { resolveShowImage } from "../../utils/gradients";

interface Props {
  endDate: Date;
  image: string;
  link: string;
  show: string;
  type: PerformanceType;
  startDate: Date;
}

function ProgramCard(card: Props) {
  const isMusical = card.type === "MUSICAL";
  const { isGradient, value } = resolveShowImage(card.image, card.show);

  return (
    <Grid sx={{ margin: "6px" }}>
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
            ".prog-image": { filter: "brightness(0.75)" },
            ".prog-overlay": { borderColor: "rgba(212,175,85,0.55)" },
            ".prog-title": { color: "#D4AF55" },
          },
        }}
      >
        <Link href={card.link} underline="none" sx={{ display: "block", height: "100%" }}>
          {/* Background */}
          {isGradient ? (
            <Box
              className="prog-image"
              sx={{
                position: "absolute",
                inset: 0,
                background: value,
                transition: "filter 0.3s",
              }}
            />
          ) : (
            <Box
              className="prog-image"
              sx={{
                position: "absolute",
                inset: 0,
                backgroundImage: `url(${value})`,
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
            className="prog-overlay"
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

          {/* Type badge */}
          <Chip
            label={isMusical ? "Musical" : "Play"}
            size="small"
            sx={{
              position: "absolute",
              top: 12,
              left: 12,
              height: 18,
              fontSize: "0.55rem",
              letterSpacing: "0.08em",
              backgroundColor: "rgba(8,12,20,0.75)",
              color: "#D4AF55",
              border: "1px solid rgba(212,175,85,0.3)",
              "& .MuiChip-label": { px: 0.75 },
            }}
          />

          {/* Bottom info */}
          <Box
            sx={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              background:
                "linear-gradient(to top, rgba(8,12,20,0.97) 0%, rgba(8,12,20,0.7) 65%, transparent 100%)",
              p: "28px 12px 12px",
            }}
          >
            <Typography
              className="prog-title"
              sx={{
                fontFamily: '"Cormorant Garamond", serif',
                fontSize: "0.95rem",
                fontWeight: 600,
                color: "#E8DCC8",
                lineHeight: 1.2,
                transition: "color 0.3s",
                mb: 0.5,
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
              }}
            >
              {moment(card.startDate).format("MMM D")}
              {" — "}
              {moment(card.endDate).format("MMM D, YYYY")}
            </Typography>
          </Box>
        </Link>
      </Card>
    </Grid>
  );
}

export default ProgramCard;
