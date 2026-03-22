import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Link from "next/link";

interface Props {
  username: string;
  year?: string | null;
  minYear?: number;
  maxYear?: number;
}

function ReviewHeader({ year, username, minYear = 2019, maxYear }: Props) {
  const currentYear = new Date().getFullYear();
  const yearMax = maxYear ?? currentYear;

  const previousYear = year ? Number(year) - 1 : null;
  const nextYear = year ? Number(year) + 1 : null;

  const showPrev = previousYear && previousYear >= minYear;
  const showNext = nextYear && nextYear <= yearMax;

  const prevYearURL = `/users/${username}/review/${previousYear}`;
  const nextYearURL = `/users/${username}/review/${nextYear}`;

  return (
    <Box
      sx={{
        borderBottom: "1px solid rgba(212,175,85,0.12)",
        background: "linear-gradient(180deg, #0D1520 0%, #080C14 100%)",
        py: 4,
      }}
    >
      <Container maxWidth="lg">
        {/* Eyebrow */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
          <Box sx={{ flex: 1, height: "1px", background: "rgba(212,175,85,0.2)" }} />
          <Typography
            sx={{
              fontFamily: '"DM Sans", sans-serif',
              fontSize: "0.6rem",
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "#D4AF55",
            }}
          >
            {year ? "Year in Review" : "All Time Statistics"}
          </Typography>
          <Box sx={{ flex: 1, height: "1px", background: "rgba(212,175,85,0.2)" }} />
        </Box>

        {/* Username */}
        <Typography
          sx={{
            fontFamily: '"Cormorant Garamond", serif',
            fontSize: { xs: "2rem", md: "3rem" },
            fontWeight: 300,
            color: "rgba(232,220,200,0.5)",
            textAlign: "center",
            lineHeight: 1,
            mb: 0.5,
          }}
        >
          {username}
        </Typography>

        {/* Year nav */}
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 2 }}>
          {showPrev ? (
            <Link href={prevYearURL} style={{ textDecoration: "none", color: "inherit" }}>
              <Box
                sx={{
                  color: "rgba(212,175,85,0.5)",
                  transition: "color 0.2s",
                  display: "flex",
                  alignItems: "center",
                  "&:hover": { color: "#D4AF55" },
                }}
              >
                <ArrowBackIosIcon sx={{ fontSize: "1rem" }} />
              </Box>
            </Link>
          ) : (
            <Box sx={{ width: 20 }} />
          )}

          <Typography
            sx={{
              fontFamily: '"Cormorant Garamond", serif',
              fontSize: { xs: "2.5rem", md: "4rem" },
              fontWeight: 600,
              color: "#D4AF55",
              lineHeight: 1,
              letterSpacing: "-0.02em",
            }}
          >
            {year ?? "All Time"}
          </Typography>

          {showNext ? (
            <Link href={nextYearURL} style={{ textDecoration: "none", color: "inherit" }}>
              <Box
                sx={{
                  color: "rgba(212,175,85,0.5)",
                  transition: "color 0.2s",
                  display: "flex",
                  alignItems: "center",
                  "&:hover": { color: "#D4AF55" },
                }}
              >
                <ArrowForwardIosIcon sx={{ fontSize: "1rem" }} />
              </Box>
            </Link>
          ) : (
            <Box sx={{ width: 20 }} />
          )}
        </Box>

        {/* View links */}
        <Box sx={{ display: "flex", justifyContent: "center", gap: 3, mt: 2 }}>
          <Link href={`/users/${username}/review`} style={{ textDecoration: "none" }}>
            <Typography
              sx={{
                fontFamily: '"DM Sans", sans-serif',
                fontSize: "0.65rem",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: !year ? "#D4AF55" : "rgba(232,220,200,0.35)",
                fontWeight: !year ? 600 : 400,
                transition: "color 0.2s",
                "&:hover": { color: "#D4AF55" },
              }}
            >
              All Time
            </Typography>
          </Link>
          {year && (
            <Typography
              sx={{
                fontFamily: '"DM Sans", sans-serif',
                fontSize: "0.65rem",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "#D4AF55",
                fontWeight: 600,
              }}
            >
              {year}
            </Typography>
          )}
        </Box>
      </Container>
    </Box>
  );
}

export default ReviewHeader;
