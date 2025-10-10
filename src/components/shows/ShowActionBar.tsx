import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorder from "@mui/icons-material/FavoriteBorder";
import LocalActivity from "@mui/icons-material/LocalActivity";
import LocalActivityOutlined from "@mui/icons-material/LocalActivityOutlined";
import WatchLater from "@mui/icons-material/WatchLater";
import WatchLaterOutlined from "@mui/icons-material/WatchLaterOutlined";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import Link from "@mui/material/Link";
import Paper from "@mui/material/Paper";
import Rating from "@mui/material/Rating";
import Snackbar from "@mui/material/Snackbar";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import type {
  attendance,
  likedShows,
  musicals,
  performances,
  plays,
  watchlist,
} from "@prisma/client";
import React, { useState } from "react";

interface Props {
  attendance: (attendance & { performances: performances })[];
  likedShows: likedShows[];
  musical?: musicals;
  play?: plays;
  sessionUser: any;
  watchlist: watchlist[];
}

function ShowActionBar({ attendance, likedShows, musical, play, sessionUser, watchlist }: Props) {
  const userId = Number(sessionUser?.id);
  const musicalId = musical ? Number(musical.id) : undefined;
  const playId = play ? Number(play.id) : undefined;
  const [copied, setCopied] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">("success");

  const performanceType = musical ? "MUSICAL" : play ? "PLAY" : null;

  const [hasAttended, setHasAttended] = useState(
    userId
      ? attendance?.some(
          (a) =>
            a.user === userId &&
            (performanceType === "MUSICAL"
              ? a.performances.musical === musicalId
              : a.performances.play === playId)
        )
      : false
  );

  const [isWatchlisted, setIsWatchlisted] = useState(
    userId
      ? watchlist.some(
          (w) =>
            w.user === userId &&
            (performanceType === "MUSICAL" ? w.musical === musicalId : w.play === playId)
        )
      : false
  );

  const [isLiked, setIsLiked] = useState(
    userId
      ? likedShows.some(
          (l) =>
            l.user === userId &&
            (performanceType === "MUSICAL" ? l.musical === musicalId : l.play === playId)
        )
      : false
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
      const response = await fetch(`/api/shows/likes`, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user: userId,
          method,
          type: performanceType,
          musical: musicalId,
          play: playId,
        }),
      });
      const data = await response.json();

      if (response.ok) {
        setIsLiked(!isLiked);
        setSnackbarMessage(
          isLiked ? "Successfully removed from liked shows." : "Successfully added to liked shows."
        );
        setSnackbarSeverity("success");
      } else {
        setSnackbarMessage(data.error || "Failed to update liked shows.");
        setSnackbarSeverity("error");
      }
      setSnackbarOpen(true);
    }
  }

  async function handleWatchlist() {
    if (sessionUser) {
      const method = isWatchlisted ? "DELETE" : "POST";
      const response = await fetch(`/api/shows/watchlist`, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user: userId,
          method,
          type: performanceType,
          musical: musicalId,
          play: playId,
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
      <Stack alignItems="center" direction="column" width="33%">
        <Button onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
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
      <Stack alignItems="center" direction="column" width="33%">
        <Button
          onClick={handleLikes}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          <Typography variant="subtitle1">
            {isLiked ? <FavoriteIcon fontSize="large" /> : <FavoriteBorder fontSize="large" />}
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
      <Stack alignItems="center" direction="column" width="33%">
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
      {sessionUser ? (
        <>
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
        </>
      ) : (
        <Link href="/login" underline="none">
          <Typography
            color="text.primary"
            style={{ padding: "1vh 0", textAlign: "center" }}
            variant="subtitle1"
          >
            Login to Log, Rate or Review
          </Typography>
        </Link>
      )}
      <Divider />
      <Divider />
      <Button
        fullWidth
        sx={{
          color: "text.primary",
          padding: "1vh 0",
          textAlign: "center",
          textTransform: "none",
        }}
        onClick={copyUrlToClipboard}
      >
        <Typography variant="subtitle1">Share</Typography>
      </Button>
      <Snackbar autoHideDuration={6000} open={snackbarOpen} onClose={() => setSnackbarOpen(false)}>
        <Alert severity={snackbarSeverity} onClose={() => setSnackbarOpen(false)}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Paper>
  );
}

export default ShowActionBar;
