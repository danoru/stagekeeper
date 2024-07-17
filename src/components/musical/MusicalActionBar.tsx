import React, { useState } from "react";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import Paper from "@mui/material/Paper";
import Rating from "@mui/material/Rating";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { musicals } from "@prisma/client";

function MusicalActionBar() {
  const [copied, setCopied] = useState(false);
  const copyUrlToClipboard = () => {
    navigator.clipboard
      .writeText(window.location.href)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch((err) => {
        console.error("Failed to copy:", err);
      });
  };

  return (
    <Paper sx={{ borderRadius: "1%" }}>
      <Stack direction="row" justifyContent="center">
        <Stack alignItems="center" padding="1vh 0" width="33%">
          <Typography variant="subtitle1">Watch</Typography>
        </Stack>
        <Stack alignItems="center" padding="1vh 0" width="33%">
          <Typography variant="subtitle1">Like</Typography>
        </Stack>
        <Stack alignItems="center" padding="1vh 0" width="33%">
          <Typography variant="subtitle1">Watchlist</Typography>
        </Stack>
      </Stack>
      <Divider />
      <Stack alignItems="center" padding="1vh 0">
        <Typography variant="subtitle1">Rate</Typography>
        <Rating />
      </Stack>
      <Divider />
      <Typography
        variant="subtitle1"
        style={{ padding: "1vh 0", textAlign: "center" }}
      >
        Review
      </Typography>
      <Divider />
      <Typography
        variant="subtitle1"
        style={{ padding: "1vh 0", textAlign: "center" }}
      >
        Performances
      </Typography>
      <Divider />
      <Button
        fullWidth
        onClick={copyUrlToClipboard}
        sx={{
          color: "text.primary",
          padding: "1vh 0",
          textAlign: "center",
          textTransform: "none",
        }}
      >
        <Typography variant="subtitle1">Share</Typography>
      </Button>
    </Paper>
  );
}

export default MusicalActionBar;
