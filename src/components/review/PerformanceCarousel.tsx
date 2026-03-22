import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Typography from "@mui/material/Typography";
import type { attendance, musicals, performances, plays, theatres } from "@prisma/client";
import moment from "moment";
import Image from "next/image";
import Link from "next/link";

import { resolveShowImage } from "../../utils/gradients";
import SimpleCarousel from "../ui/SimpleCarousel";

interface Props {
  items: (attendance & {
    performances: performances & { musicals: musicals; plays: plays; theatres: theatres };
  })[];
}

interface CardProps {
  title: string;
  location: string;
  duration?: number | null;
  playhouse: string;
  date: Date;
  playbill?: string;
  type: "MUSICAL" | "PLAY";
}

function PerformanceCarousel({ items }: Props) {
  if (!items || items.length === 0) return null;

  return (
    <Box sx={{ borderBottom: "1px solid rgba(212,175,85,0.12)", py: 3, background: "#080C14" }}>
      <SimpleCarousel autoplay interval={4000} sx={{ maxWidth: 480, mx: "auto" }}>
        {items.map((item, i) => {
          const isMusical = item.performances.type === "MUSICAL";
          return (
            <Box key={i} sx={{ px: 1 }}>
              <CarouselItem
                date={item.performances.startTime}
                duration={item.performances.musicals?.duration || item.performances.plays?.duration}
                location={item.performances.theatres.location}
                playbill={item.performances.musicals?.playbill || item.performances.plays?.playbill}
                playhouse={item.performances.theatres.name}
                title={item.performances.musicals?.title || item.performances.plays?.title || ""}
                type={item.performances.type as "MUSICAL" | "PLAY"}
              />
            </Box>
          );
        })}
      </SimpleCarousel>
    </Box>
  );
}

function CarouselItem({ title, location, playhouse, date, playbill, type }: CardProps) {
  const isMusical = type === "MUSICAL";
  const showType = isMusical ? "musicals" : "plays";
  const slug = `/${showType}/${title.replace(/\s+/g, "-").toLowerCase()}`;
  const { isGradient, value } = resolveShowImage(playbill ?? "", title);
  const humanReadableDate = moment(date).format("MMMM Do, YYYY");

  return (
    <Link href={slug} style={{ textDecoration: "none" }}>
      <Box
        sx={{
          position: "relative",
          height: 300,
          overflow: "hidden",
          border: "1px solid rgba(212,175,85,0.15)",
          borderRadius: 1,
          cursor: "pointer",
          "&:hover .pc-image": { filter: "brightness(0.8)" },
          "&:hover .pc-overlay": { borderColor: "rgba(212,175,85,0.5)" },
          "&:hover .pc-title": { color: "#D4AF55" },
        }}
      >
        {isGradient ? (
          <Box
            className="pc-image"
            sx={{ position: "absolute", inset: 0, background: value, transition: "filter 0.3s" }}
          />
        ) : (
          <Box
            className="pc-image"
            sx={{
              position: "absolute",
              inset: 0,
              backgroundImage: `url(${value})`,
              backgroundSize: "contain",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "center",
              filter: "brightness(0.6)",
              transition: "filter 0.3s",
            }}
          />
        )}
        {/* Vignette */}
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to top, rgba(8,12,20,0.98) 0%, rgba(8,12,20,0.3) 55%, transparent 100%)",
            pointerEvents: "none",
          }}
        />
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
          className="pc-overlay"
          sx={{
            position: "absolute",
            top: "8px",
            right: "8px",
            bottom: "8px",
            left: "8px",
            border: "1px solid rgba(212,175,85,0.2)",
            pointerEvents: "none",
            transition: "border-color 0.3s",
          }}
        />

        {/* Type chip */}
        <Chip
          label={isMusical ? "Musical" : "Play"}
          size="small"
          sx={{
            position: "absolute",
            top: 14,
            left: 14,
            height: 20,
            fontSize: "0.58rem",
            letterSpacing: "0.08em",
            backgroundColor: "rgba(8,12,20,0.8)",
            color: "#D4AF55",
            border: "1px solid rgba(212,175,85,0.3)",
            "& .MuiChip-label": { px: 1 },
          }}
        />

        {/* Info */}
        <Box sx={{ position: "absolute", bottom: 0, left: 0, right: 0, p: "0 18px 18px" }}>
          <Typography
            className="pc-title"
            sx={{
              fontFamily: '"Cormorant Garamond", serif',
              fontSize: "1.5rem",
              fontWeight: 600,
              color: "#E8DCC8",
              lineHeight: 1.1,
              mb: 0.5,
              transition: "color 0.3s",
            }}
          >
            {title}
          </Typography>
          <Typography
            sx={{
              fontFamily: '"DM Sans", sans-serif',
              fontSize: "0.68rem",
              color: "rgba(212,175,85,0.65)",
              mb: 0.25,
            }}
          >
            {playhouse}
          </Typography>
          <Typography
            sx={{
              fontFamily: '"DM Sans", sans-serif',
              fontSize: "0.62rem",
              color: "rgba(232,220,200,0.4)",
            }}
          >
            {location} · {humanReadableDate}
          </Typography>
        </Box>
      </Box>
    </Link>
  );
}

export default PerformanceCarousel;
