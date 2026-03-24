import { Box, Card, CardMedia, Grid, Link, Typography } from "@mui/material";

import { resolveShowImage } from "../../utils/gradients";

interface Props {
  link: string;
  image: string;
  name: string;
}

function TheatreCard(props: Props) {
  const { isGradient, value } = resolveShowImage(props.image, props.name);

  return (
    <Grid sx={{ margin: "10px" }}>
      <Card
        sx={{
          position: "relative",
          height: "190px",
          width: "270px",
          overflow: "hidden",
          border: "1px solid rgba(212,175,85,0.1)",
          transition: "border-color 0.3s, transform 0.3s, box-shadow 0.3s",
          "&:hover": {
            borderColor: "rgba(212,175,85,0.35)",
            transform: "translateY(-3px)",
            boxShadow: "0 12px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(212,175,85,0.2)",
            ".theatre-image": { filter: "brightness(0.75)" },
            ".theatre-overlay": { borderColor: "rgba(212,175,85,0.55)" },
            ".theatre-name": { color: "#D4AF55" },
          },
        }}
      >
        <Link href={props.link} underline="none" sx={{ display: "block", height: "100%" }}>
          {isGradient ? (
            <Box
              className="theatre-image"
              sx={{
                position: "absolute",
                inset: 0,
                background: value,
                transition: "filter 0.3s",
              }}
            />
          ) : (
            <CardMedia
              className="theatre-image"
              image={value}
              sx={{
                position: "absolute",
                inset: 0,
                filter: "brightness(0.55)",
                transition: "filter 0.3s",
              }}
              title={props.name}
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
            className="theatre-overlay"
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

          {/* Name gradient + text */}
          <Box
            sx={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              background:
                "linear-gradient(to top, rgba(8,12,20,0.97) 0%, rgba(8,12,20,0.65) 60%, transparent 100%)",
              p: "28px 14px 12px",
            }}
          >
            <Typography
              className="theatre-name"
              sx={{
                fontFamily: '"Cormorant Garamond", serif',
                fontSize: "1rem",
                fontWeight: 600,
                color: "#E8DCC8",
                lineHeight: 1.2,
                transition: "color 0.3s",
              }}
            >
              {props.name}
            </Typography>
          </Box>
        </Link>
      </Card>
    </Grid>
  );
}

export default TheatreCard;
