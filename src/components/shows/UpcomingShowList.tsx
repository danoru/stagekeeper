import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Typography from "@mui/material/Typography";
import type { musicals, plays, programming, seasons, theatres } from "@prisma/client";
import moment from "moment";
import Link from "next/link";

import { resolveShowImage } from "../../utils/gradients";
import SimpleCarousel from "../ui/SimpleCarousel";

interface Props {
  upcomingPerformances: (programming & {
    musicals?: musicals;
    plays?: plays;
    seasons: seasons & { theatres: theatres };
  })[];
}

function UpcomingShowList({ upcomingPerformances }: Props) {
  if (!upcomingPerformances || upcomingPerformances.length === 0) {
    return null;
  }

  return (
    <Box sx={{ mb: 5 }}>
      {/* Section label */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
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
          Upcoming Performances
        </Typography>
        <Box sx={{ flex: 1, height: "1px", background: "rgba(212,175,85,0.2)" }} />
      </Box>

      <SimpleCarousel autoplay interval={5000} sx={{ maxWidth: 520, mx: "auto" }}>
        {upcomingPerformances.map((performance: any) => {
          const isMusical = performance.type === "MUSICAL";
          const showType = isMusical ? "musicals" : "plays";
          const title = isMusical ? performance.musicals?.title : performance.plays?.title;
          const image = isMusical ? performance.musicals?.playbill : performance.plays?.playbill;
          const { isGradient, value } = resolveShowImage(image ?? "", title ?? "");
          const slug = `/${showType}/${title?.replace(/\s+/g, "-").toLowerCase()}`;

          return (
            <Link key={performance.id} href={slug} style={{ textDecoration: "none" }}>
              <Box
                sx={{
                  position: "relative",
                  height: 320,
                  overflow: "hidden",
                  border: "1px solid rgba(212,175,85,0.15)",
                  borderRadius: 1,
                  cursor: "pointer",
                  "&:hover .upcoming-image": { filter: "brightness(0.8)" },
                  "&:hover .upcoming-overlay": { borderColor: "rgba(212,175,85,0.5)" },
                  "&:hover .upcoming-title": { color: "#D4AF55" },
                }}
              >
                {/* Background */}
                {isGradient ? (
                  <Box
                    className="upcoming-image"
                    sx={{
                      position: "absolute",
                      inset: 0,
                      background: value,
                      transition: "filter 0.3s",
                    }}
                  />
                ) : (
                  <Box
                    className="upcoming-image"
                    sx={{
                      position: "absolute",
                      inset: 0,
                      backgroundImage: `url(${value})`,
                      backgroundSize: "contain",
                      backgroundRepeat: "no-repeat",
                      backgroundPosition: "center",
                      filter: "brightness(0.65)",
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
                      "linear-gradient(to top, rgba(8,12,20,0.97) 0%, rgba(8,12,20,0.3) 50%, transparent 100%)",
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
                    background:
                      "linear-gradient(90deg, transparent, rgba(212,175,85,0.5), transparent)",
                    pointerEvents: "none",
                  }}
                />

                {/* Inner border */}
                <Box
                  className="upcoming-overlay"
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
                <Box
                  sx={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    p: "0 20px 20px",
                  }}
                >
                  <Typography
                    className="upcoming-title"
                    sx={{
                      fontFamily: '"Cormorant Garamond", serif',
                      fontSize: "1.6rem",
                      fontWeight: 600,
                      color: "#E8DCC8",
                      lineHeight: 1.1,
                      mb: 0.75,
                      transition: "color 0.3s",
                    }}
                  >
                    {title}
                  </Typography>
                  <Typography
                    sx={{
                      fontFamily: '"DM Sans", sans-serif',
                      fontSize: "0.72rem",
                      color: "rgba(212,175,85,0.7)",
                      mb: 0.25,
                    }}
                  >
                    {moment(performance.startDate).format("MMMM D, YYYY")}
                    {" — "}
                    {moment(performance.endDate).format("MMMM D, YYYY")}
                  </Typography>
                  <Typography
                    sx={{
                      fontFamily: '"DM Sans", sans-serif',
                      fontSize: "0.68rem",
                      color: "rgba(232,220,200,0.45)",
                      letterSpacing: "0.06em",
                    }}
                  >
                    {performance.seasons?.theatres.name}
                  </Typography>
                </Box>
              </Box>
            </Link>
          );
        })}
      </SimpleCarousel>
    </Box>
  );
}

export default UpcomingShowList;
