import { Box, Link, Stack } from "@mui/material";

const linkSx = {
  fontFamily: '"DM Sans", sans-serif',
  fontSize: "0.7rem",
  color: "rgba(232,220,200,0.4)",
  "&:hover": { color: "#D4AF55" },
};

function SiteFooter() {
  return (
    <Box component="footer" sx={{ background: "#080C14", py: 3, px: 2 }}>
      <Stack direction="row" justifyContent="center" spacing={2}>
        <Link href="/terms" sx={linkSx} underline="none">
          Terms
        </Link>
        <Link href="/privacy" sx={linkSx} underline="none">
          Privacy
        </Link>
      </Stack>
    </Box>
  );
}

export default SiteFooter;
