import React, { useState } from "react";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import Paper from "@mui/material/Paper";
import Rating from "@mui/material/Rating";
import Snackbar from "@mui/material/Snackbar";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { musicals, watchlist } from "@prisma/client";
import { WatchLater, WatchLaterOutlined } from "@mui/icons-material";
import Alert from "@mui/material/Alert";

interface Props {
  musical: musicals;
  sessionUser: any;
  watchlist: watchlist[];
}

function MusicalActionBar({ musical, sessionUser, watchlist }: Props) {
  const userId = Number(sessionUser.id);
  const musicalId = Number(musical.id);
  const [copied, setCopied] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">(
    "success"
  );
  const [isWatchlisted, setIsWatchlisted] = useState(
    watchlist.some((w) => w.user === userId && w.musical === musicalId)
  );

  const copyUrlToClipboard = () => {
    navigator.clipboard
      .writeText(window.location.href)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        setSnackbarMessage("Successfully copied.");
        setSnackbarOpen(true);
        setSnackbarSeverity("success");
      })
      .catch((err) => {
        console.error("Failed to copy:", err);
        setSnackbarMessage("Failed to copy.");
        setSnackbarOpen(true);
        setSnackbarSeverity("error");
      });
  };

  async function handleWatchlist() {
    if (sessionUser) {
      const method = isWatchlisted ? "DELETE" : "POST";
      const response = await fetch(`/api/musicals/watchlist`, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user: userId,
          method,
          musical: musicalId,
        }),
      });
      const data = await response.json();

      if (response.ok) {
        setIsWatchlisted(!isWatchlisted);
        setSnackbarMessage(
          isWatchlisted
            ? "Successfully removed from watchlist."
            : "Successfully added to watchlist."
        );
        setSnackbarSeverity("success");
      } else {
        setSnackbarMessage(data.error || "Failed to update watchlist.");
        setSnackbarSeverity("error");
      }
      setSnackbarOpen(true);
    }
  }

  const WatchlistButton = () => {
    return (
      <Stack direction="column" alignItems="center" width="33%">
        <Button
          onClick={handleWatchlist}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          <Typography variant="subtitle1">
            {isWatchlisted ? (
              <WatchLater fontSize="large" />
            ) : (
              <WatchLaterOutlined fontSize="large" />
            )}
          </Typography>
        </Button>
        <Typography variant="subtitle1">
          {isWatchlisted ? (hovered ? "Remove" : "Watchlist") : "Watchlist"}
        </Typography>
      </Stack>
    );
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
        <WatchlistButton />
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
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarSeverity}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Paper>
  );
}

export default MusicalActionBar;
