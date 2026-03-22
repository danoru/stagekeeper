import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Head from "next/head";
import { Fragment } from "react";

function ErrorPage() {
  return (
    <Fragment>
      <Head>
        <title>404 • StageKeeper</title>
      </Head>
      <Box
        sx={{
          minHeight: "100vh",
          background: "#080C14",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          px: 4,
          textAlign: "center",
        }}
      >
        <Box sx={{ maxWidth: 520 }}>
          {/* Gold rule + eyebrow */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
            <Box sx={{ flex: 1, height: "1px", background: "rgba(212,175,85,0.3)" }} />
            <Typography
              sx={{
                fontFamily: '"DM Sans", sans-serif',
                fontSize: "0.6rem",
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                color: "#D4AF55",
                whiteSpace: "nowrap",
              }}
            >
              404
            </Typography>
            <Box sx={{ flex: 1, height: "1px", background: "rgba(212,175,85,0.3)" }} />
          </Box>

          {/* Big number */}
          <Typography
            sx={{
              fontFamily: '"Cormorant Garamond", serif',
              fontSize: "7rem",
              fontWeight: 300,
              color: "rgba(212,175,85,0.12)",
              lineHeight: 1,
              letterSpacing: "-0.04em",
              mb: -2,
              userSelect: "none",
            }}
          >
            404
          </Typography>

          <Typography
            sx={{
              fontFamily: '"Cormorant Garamond", serif',
              fontSize: "2rem",
              fontWeight: 600,
              color: "#E8DCC8",
              lineHeight: 1.1,
              mb: 3,
            }}
          >
            Lost in the Woods
          </Typography>

          {/* The Frozen quote — keeping it */}
          <Box
            sx={{
              borderLeft: "2px solid rgba(212,175,85,0.3)",
              pl: 3,
              mb: 4,
              textAlign: "left",
            }}
          >
            <Typography
              sx={{
                fontFamily: '"Cormorant Garamond", serif',
                fontStyle: "italic",
                fontSize: "1.05rem",
                color: "rgba(232,220,200,0.55)",
                lineHeight: 1.8,
              }}
            >
              Now I turn around and find I am lost in the woods,
              <br />
              North is south, right is left, when you&apos;re gone.
            </Typography>
            <Typography
              sx={{
                fontFamily: '"DM Sans", sans-serif',
                fontSize: "0.62rem",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "rgba(212,175,85,0.4)",
                mt: 1,
              }}
            >
              Jonathan Groff — Lost in the Woods, Frozen
            </Typography>
          </Box>

          <Typography
            sx={{
              fontFamily: '"DM Sans", sans-serif',
              fontSize: "0.85rem",
              color: "rgba(232,220,200,0.4)",
              mb: 4,
            }}
          >
            This page couldn&apos;t be found. Let&apos;s get you back on stage.
          </Typography>

          <Button
            href="/"
            variant="contained"
            sx={{ px: 4, py: 1.25, fontSize: "0.75rem", letterSpacing: "0.1em" }}
          >
            Back to StageKeeper
          </Button>
        </Box>
      </Box>
    </Fragment>
  );
}

export default ErrorPage;
