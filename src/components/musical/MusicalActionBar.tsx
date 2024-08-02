import React, { useState } from "react";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorder from "@mui/icons-material/FavoriteBorder";
import LocalActivity from "@mui/icons-material/LocalActivity";
import LocalActivityOutlined from "@mui/icons-material/LocalActivityOutlined";
import Paper from "@mui/material/Paper";
import Rating from "@mui/material/Rating";
import Snackbar from "@mui/material/Snackbar";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import WatchLater from "@mui/icons-material/WatchLater";
import WatchLaterOutlined from "@mui/icons-material/WatchLaterOutlined";
import {
  attendance,
  likedMusicals,
  musicals,
  performances,
  watchlist,
} from "@prisma/client";

interface Props {
  attendance: (attendance & { performance: performances })[];
  likedMusicals: likedMusicals[];
  musical: musicals;
  sessionUser: any;
  watchlist: watchlist[];
}

function MusicalActionBar({
  attendance,
  likedMusicals,
  musical,
  sessionUser,
  watchlist,
}: Props) {
  const userId = Number(sessionUser.id);
  const musicalId = Number(musical.id);
  const [copied, setCopied] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">(
    "success"
  );

  const [hasAttended, setHasAttended] = useState(
    attendance.some(
      (a) => a.user === userId && a.performance.musical === musicalId
    )
  );
  const [isWatchlisted, setIsWatchlisted] = useState(
    watchlist.some((w) => w.user === userId && w.musical === musicalId)
  );
  const [isLiked, setIsLiked] = useState(
    likedMusicals.some((l) => l.user === userId && l.musical === musicalId)
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

  async function handleLikes() {
    if (sessionUser) {
      const method = isLiked ? "DELETE" : "POST";
      const response = await fetch(`/api/musicals/likes`, {
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
        setIsLiked(!isLiked);
        setSnackbarMessage(
          isLiked
            ? "Successfully removed from liked musicals."
            : "Successfully added to liked musicals."
        );
        setSnackbarSeverity("success");
      } else {
        setSnackbarMessage(data.error || "Failed to update liked musicals.");
        setSnackbarSeverity("error");
      }
      setSnackbarOpen(true);
    }
  }

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

  const AttendanceButton = () => {
    return (
      <Stack direction="column" alignItems="center" width="33%">
        <Button
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          <Typography variant="subtitle1">
            {hasAttended ? (
              <LocalActivity fontSize="large" />
            ) : (
              <LocalActivityOutlined fontSize="large" />
            )}
          </Typography>
        </Button>
        <Typography variant="subtitle1">
          {hasAttended ? (hovered ? "Remove" : "Attended") : "Attend"}
        </Typography>
      </Stack>
    );
  };

  const LikedButton = () => {
    return (
      <Stack direction="column" alignItems="center" width="33%">
        <Button
          onClick={handleLikes}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          <Typography variant="subtitle1">
            {isLiked ? (
              <FavoriteIcon fontSize="large" />
            ) : (
              <FavoriteBorder fontSize="large" />
            )}
          </Typography>
        </Button>
        <Typography variant="subtitle1">
          {isLiked ? (hovered ? "Remove" : "Liked") : "Like"}
        </Typography>
      </Stack>
    );
  };

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
        <AttendanceButton />
        <LikedButton />
        <WatchlistButton />
      </Stack>
      <Divider />
      <Stack alignItems="center" padding="1vh 0">
        <Typography variant="subtitle1">Rating</Typography>
        <Rating readOnly />
      </Stack>
      <Divider />
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
