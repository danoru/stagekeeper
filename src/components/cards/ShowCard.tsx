import { Badge, Box, Card, CardMedia, Grid, Link, Typography } from "@mui/material";

import { resolveShowImage } from "../../utils/gradients";

interface Props {
  hasUpcomingPerformance?: boolean;
  image: string;
  link: string;
  name: string;
}

function ShowCard({ hasUpcomingPerformance, image, link, name }: Props) {
  const { isGradient, value } = resolveShowImage(image, name);

  return (
    <Grid sx={{ margin: "10px" }}>
      <Badge
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        badgeContent={hasUpcomingPerformance ? "Soon" : null}
        color="primary"
        sx={{
          "& .MuiBadge-badge": {
            fontSize: "0.5rem",
            letterSpacing: "0.08em",
            px: 1,
            height: 16,
            minWidth: 16,
          },
        }}
      >
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
              transform: "translateY(-3px)",
              boxShadow: "0 12px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(212,175,85,0.2)",
              ".show-image": { filter: "brightness(0.75)" },
              ".show-overlay": { borderColor: "rgba(212,175,85,0.6)" },
              ".show-title": { color: "#D4AF55" },
            },
          }}
        >
          <Link href={link} underline="none" sx={{ display: "block", height: "100%" }}>
            {isGradient ? (
              <Box
                className="show-image"
                sx={{
                  position: "absolute",
                  inset: 0,
                  background: value,
                  transition: "filter 0.3s",
                }}
              />
            ) : (
              <CardMedia
                className="show-image"
                image={value}
                sx={{
                  position: "absolute",
                  inset: 0,
                  filter: "brightness(0.6)",
                  transition: "filter 0.3s",
                }}
                title={name}
              />
            )}

            {/* Inner border overlay */}
            <Box
              className="show-overlay"
              sx={{
                position: "absolute",
                top: "6px",
                right: "6px",
                bottom: "6px",
                left: "6px",
                border: "1px solid rgba(212,175,85,0.25)",
                pointerEvents: "none",
                transition: "border-color 0.3s",
              }}
            />

            {/* Gold accent line at top */}
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

            {/* Title at bottom */}
            <Box
              sx={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                background:
                  "linear-gradient(to top, rgba(8,12,20,0.95) 0%, rgba(8,12,20,0.7) 60%, transparent 100%)",
                p: "24px 12px 12px",
              }}
            >
              <Typography
                className="show-title"
                sx={{
                  fontFamily: '"Cormorant Garamond", serif',
                  fontSize: "0.95rem",
                  fontWeight: 600,
                  color: "#E8DCC8",
                  lineHeight: 1.2,
                  transition: "color 0.3s",
                  textAlign: "left",
                }}
              >
                {name}
              </Typography>
            </Box>
          </Link>
        </Card>
      </Badge>
    </Grid>
  );
}

export default ShowCard;
